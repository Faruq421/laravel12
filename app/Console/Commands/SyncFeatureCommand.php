<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class SyncFeatureCommand extends Command
{
    protected $signature = 'sync:feature {name}';
    protected $description = 'Sync the feature files with the database table schema';

    protected $files;
    protected $featureName; // ProductCategory

    public function __construct(Filesystem $files)
    {
        parent::__construct();
        $this->files = $files;
    }

    public function handle()
    {
        $this->featureName = Str::studly($this->argument('name'));
        $tableName = Str::snake(Str::plural($this->featureName));

        if (!Schema::hasTable($tableName)) {
            $this->error("Table '{$tableName}' not found. Please run migrations first.");
            return 1;
        }

        $this->info("Syncing feature {$this->featureName} with table {$tableName}...");

        $columns = $this->getTableSchema($tableName);

        $this->updateModel($columns);
        $this->updateControllerValidation($columns);
        $this->updateReactIndex($columns);
        $this->updateReactForm($columns);

        $this->info("Sync completed successfully!");
        return 0;
    }

    protected function getTableSchema($tableName): array
    {
        $columns = [];
        $schemaColumns = Schema::getColumns($tableName);

        $excluded = ['id', 'created_at', 'updated_at', 'deleted_at'];

        foreach ($schemaColumns as $column) {
            if (in_array($column['name'], $excluded)) continue;

            $columns[] = [
                'name' => $column['name'],
                'type' => $column['type_name'],
                'required' => !$column['nullable'],
            ];
        }
        return $columns;
    }

    protected function updateFileContent($path, $pattern, $replacement)
    {
        if (!$this->files->exists($path)) {
            $this->warn("File not found: {$path}");
            return;
        }
        $content = $this->files->get($path);
        $newContent = preg_replace($pattern, $replacement, $content);

        if ($newContent === null) {
            $this->error("Regex failed for file: {$path}");
            return;
        }

        $this->files->put($path, $newContent);
        $this->line("Updated file: {$path}");
    }

    protected function updateModel($columns)
    {
        $path = app_path("Features/{$this->featureName}/{$this->featureName}.php");

        // Update Fillable
        $fillable = collect($columns)->pluck('name')->map(fn($name) => "'{$name}'")->implode(",\n        ");
        $this->updateFileContent($path, '/\/\/ SYNC_FILLABLE_START.*?\/\/ SYNC_FILLABLE_END/s', "// SYNC_FILLABLE_START\n    protected \$fillable = [\n        {$fillable}\n    ];\n    // SYNC_FILLABLE_END");

        // Update Casts
        $casts = collect($columns)->map(function ($col) {
            $castType = match ($col['type']) {
                'int2', 'int4', 'int8', 'integer' => 'integer',
                'bool', 'boolean' => 'boolean',
                'timestamp', 'date', 'datetime' => 'datetime',
                'json', 'jsonb' => 'array',
                'float4', 'float8', 'numeric', 'decimal' => 'decimal:2', // Default decimal
                default => null
            };
            return $castType ? "'{$col['name']}' => '{$castType}'," : null;
        })->filter()->implode("\n        ");
        $this->updateFileContent($path, '/\/\/ SYNC_CASTS_START.*?\/\/ SYNC_CASTS_END/s', "// SYNC_CASTS_START\n    protected \$casts = [\n        {$casts}\n    ];\n    // SYNC_CASTS_END");
    }

    protected function updateControllerValidation($columns)
    {
        // Note: A better approach is using Form Requests, but for simplicity, we'll inject into the controller.
        $path = app_path("Features/{$this->featureName}/{$this->featureName}Controller.php");

        $rules = collect($columns)->map(function ($col) {
            $ruleParts = [];
            $ruleParts[] = $col['required'] ? "'required'" : "'nullable'";
            $laravelType = match ($col['type']) {
                'int2', 'int4', 'int8', 'integer' => 'integer',
                'bool', 'boolean' => 'boolean',
                'timestamp', 'date', 'datetime' => 'date',
                'json', 'jsonb' => 'array',
                'float4', 'float8', 'numeric', 'decimal' => 'numeric',
                default => 'string'
            };
            $ruleParts[] = "'{$laravelType}'";
            if ($laravelType === 'string') $ruleParts[] = "'max:255'";

            return "'{$col['name']}' => [" . implode(', ', $ruleParts) . "],";
        })->implode("\n            ");

        $validationLogic = "\$validated = \$request->validate([\n            {$rules}\n        ]);";

        // Update Store Method
        $this->updateFileContent($path, "/({{ StudlyName }}::create\(\\\$request->all\(\)\);)/", "{$validationLogic}\n        {{ StudlyName }}::create(\$validated);");

        // Update Update Method
        $this->updateFileContent($path, "/(\\\${{ camelName }}->update\(\\\$request->all\(\)\);)/", "{$validationLogic}\n        \${{ camelName }}->update(\$validated);");
    }

    protected function updateReactIndex($columns)
    {
        $path = resource_path("js/pages/Features/{$this->featureName}/Index.tsx");
        $nameFormats = $this->getNameFormats();

        // Memperbarui definisi tipe TypeScript
        $tsInterfaces = $this->generateTypeScriptInterfaces($columns);
        $this->updateFileContent($path, '/\/\/ SYNC_ITEM_TYPE_START.*?\/\/ SYNC_ITEM_TYPE_END/s', "// SYNC_ITEM_TYPE_START\n{$tsInterfaces}\n    // SYNC_ITEM_TYPE_END");

        // Memperbarui header tabel
        $headers = "<th className=\"px-4 py-2 w-20\">ID</th>\n";
        $headers .= collect($columns)->map(fn($col) => "<th className=\"px-4 py-2\">" . Str::headline($col['name']) . "</th>")->implode("\n");
        $headers .= "\n<th className=\"px-4 py-2\">Action</th>";
        $this->updateFileContent($path, '/{\/\* SYNC_TABLE_HEADERS_START \*\/}.*?{\/\* SYNC_TABLE_HEADERS_END \*\/}/s', "{/* SYNC_TABLE_HEADERS_START */}\n{$headers}\n{/* SYNC_TABLE_HEADERS_END */}");

        // Memperbarui baris data tabel dengan komponen bervariasi
        $cells = "<td className=\"border px-4 py-2\">{ item.id }</td>\n";
        $cells .= collect($columns)->map(function ($col) {
            $columnName = $col['name'];

            return match ($col['type']) {
                'bool', 'boolean' => "<td className=\"border px-4 py-2\"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full$item.{$columnName} ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{ item.{$columnName} ? 'Active' : 'Inactive' }</span></td>",
                'date', 'datetime', 'timestamp' => "<td className=\"border px-4 py-2\">{ new Date(item.{$columnName}).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) }</td>",
                'numeric', 'decimal' => "<td className=\"border px-4 py-2 text-right\">{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.{$columnName}) }</td>",
                'text' => "<td className=\"border px-4 py-2\">{ item.{$columnName} ? (item.{$columnName}.substring(0, 50) + (item.{$columnName}.length > 50 ? '...' : '')) : '' }</td>",
                default => "<td className=\"border px-4 py-2\">{ item.{$columnName} }</td>",
            };
        })->implode("\n");

        // Menambahkan kembali kolom Action
        $pluralKebabName = $nameFormats['{{ pluralKebabName }}'];
        $cells .= "\n<td className=\"border px-4 py-2\">
                                            <Link
                                                tabIndex={1}
                                                className=\"px-4 py-2 text-sm text-white bg-blue-500 rounded\"
                                                href={route('{$pluralKebabName}.edit', item.id)}
                                            >
                                                Edit
                                            </Link>
                                        </td>";
        $this->updateFileContent($path, '/{\/\* SYNC_TABLE_ROWS_START \*\/}.*?{\/\* SYNC_TABLE_ROWS_END \*\/}/s', "{/* SYNC_TABLE_ROWS_START */}\n{$cells}\n{/* SYNC_TABLE_ROWS_END */}");
    }

    protected function updateReactForm($columns)
    {
        $path = resource_path("js/pages/Features/{$this->featureName}/FormPage.tsx");

        $tsInterfaces = $this->generateTypeScriptInterfaces($columns);
        $this->updateFileContent($path, '/\/\/ SYNC_FORM_ITEM_TYPE_START.*?\/\/ SYNC_FORM_ITEM_TYPE_END/s', "// SYNC_FORM_ITEM_TYPE_START\n{$tsInterfaces}\n    // SYNC_FORM_ITEM_TYPE_END");

        // Update useForm data types and values
        $formDataType = $this->generateTypeScriptInterfaces($columns);
        $formDataValues = collect($columns)->map(function ($col) {
            $defaultValue = match ($col['type']) {
                'int2', 'int4', 'int8', 'integer', 'numeric', 'decimal' => '0',
                'bool', 'boolean' => '?? false', // Default ke false untuk item baru
                'date', 'datetime', 'timestamp' => "|| ''",
                default => "|| ''"
            };
            return "        {$col['name']}: item?.{$col['name']} {$defaultValue},";
        })->implode("\n");
        $this->updateFileContent($path, '/\/\/ SYNC_FORM_DATA_START.*?\/\/ SYNC_FORM_DATA_END/s', "// SYNC_FORM_DATA_START\n    const { data, setData, post, put, processing, errors } = useForm<{\n{$formDataType}\n    }>({
{$formDataValues}\n    });\n    // SYNC_FORM_DATA_END");

        // Update Form Fields with varied components
        $formFields = collect($columns)->map(function ($col) {
            $label = Str::headline($col['name']);
            $name = $col['name'];

            $inputType = match ($col['type']) {
                'text' => 'textarea',
                'bool', 'boolean' => 'checkbox',
                'date' => 'date',
                'datetime', 'timestamp' => 'datetime-local',
                'int2', 'int4', 'int8', 'integer' => 'number',
                'float4', 'float8', 'numeric', 'decimal' => 'number',
                default => 'text'
            };

            if ($inputType === 'checkbox') {
                return <<<HTML
                <div className="block mt-4">
                    <label className="flex items-center">
                        <input type="checkbox" name="{$name}" checked={data.{$name}} onChange={e => setData('{$name}', e.target.checked)} className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500" />
                        <span className="ms-2 text-sm text-gray-600">{$label}</span>
                    </label>
                    {errors.{$name} && <div className="text-red-500 text-xs mt-1">{errors.{$name}}</div>}
                </div>
HTML;
            }

            if ($inputType === 'textarea') {
                return <<<HTML
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="{$name}">{$label}</label>
                    <textarea id="{$name}" value={data.{$name}} onChange={e => setData('{$name}', e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
                    {errors.{$name} && <div className="text-red-500 text-xs mt-1">{errors.{$name}}</div>}
                </div>
HTML;
            }

            // Default input text, number, date, etc.
            return <<<HTML
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="{$name}">{$label}</label>
                <input id="{$name}" type="{$inputType}" value={data.{$name}} onChange={e => setData('{$name}', e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" step="any" />
                {errors.{$name} && <div className="text-red-500 text-xs mt-1">{errors.{$name}}</div>}
            </div>
HTML;
        })->implode("\n");
        $this->updateFileContent($path, '/{\/\* SYNC_FORM_FIELDS_START \*\/}.*?{\/\* SYNC_FORM_FIELDS_END \*\/}/s', "{/* SYNC_FORM_FIELDS_START */}\n{$formFields}\n{/* SYNC_FORM_FIELDS_END */}");
    }

    protected function generateTypeScriptInterfaces($columns)
    {
        return collect($columns)->map(function ($col) {
            $tsType = match ($col['type']) {
                'int2', 'int4', 'int8', 'integer', 'numeric', 'decimal', 'float4', 'float8' => 'number',
                'bool', 'boolean' => 'boolean',
                default => 'string', // varchar, text, date, timestamp, etc.
            };
            return "    {$col['name']}: {$tsType};";
        })->implode("\n");
    }

    // Tambahkan method ini ke dalam class SyncFeatureCommand

    protected function getNameFormats()
    {
        $studly = $this->featureName;
        return [
            '{{ StudlyName }}'      => $studly,
            '{{ camelName }}'       => Str::camel($studly),
            '{{ pluralCamelName }}' => Str::camel(Str::plural($studly)),
            '{{ kebabName }}'       => Str::kebab($studly),
            '{{ pluralKebabName }}' => Str::kebab(Str::plural($studly)),
            '{{ snakeName }}'       => Str::snake($studly),
            '{{ pluralSnakeName }}' => Str::snake(Str::plural($studly)),
            '{{ spacedName }}'      => Str::headline($studly),
            '{{ pluralSpacedName }}'=> Str::headline(Str::plural($studly)),
        ];
    }
}
