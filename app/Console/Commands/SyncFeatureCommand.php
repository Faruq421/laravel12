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

        $tsInterfaces = $this->generateTypeScriptInterfaces($columns);
        $this->updateFileContent($path, '/\/\/ SYNC_ITEM_TYPE_START.*?\/\/ SYNC_ITEM_TYPE_END/s', "// SYNC_ITEM_TYPE_START\n{$tsInterfaces}\n    // SYNC_ITEM_TYPE_END");

        // Memperbarui header tabel
        $headers = "<TableHead className=\"w-[80px]\">ID</TableHead>\n";
        $headers .= collect($columns)->map(fn($col) => "<TableHead>" . Str::headline($col['name']) . "</TableHead>")->implode("\n");
        $headers .= "\n<TableHead className=\"text-right\">Action</TableHead>";
        $this->updateFileContent($path, '/{\/\* SYNC_TABLE_HEADERS_START \*\/}.*?{\/\* SYNC_TABLE_HEADERS_END \*\/}/s', "{/* SYNC_TABLE_HEADERS_START */}\n{$headers}\n{/* SYNC_TABLE_HEADERS_END */}");

        // Memperbarui baris data tabel
        $cells = "<TableCell className=\"font-medium\">{item.id}</TableCell>\n";
        $cells .= collect($columns)->map(function ($col) {
            $columnName = $col['name'];

            return match ($col['type']) {
                'bool', 'boolean' => "<TableCell><div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 $item.{$columnName} ?'border-transparent bg-green-600 text-secondary hover:bg-green-700': 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80'}> { item.{$columnName} ? 'Active' : 'Inactive' }</div></TableCell>",
                'date', 'datetime', 'timestamp' => "<TableCell>{ new Date(item.{$columnName}).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) }</TableCell>",
                'numeric', 'decimal' => "<TableCell className=\"text-right\">{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.{$columnName}) }</TableCell>",
                'text' => "<TableCell>{ item.{$columnName} ? (item.{$columnName}.substring(0, 50) + (item.{$columnName}.length > 50 ? '...' : '')) : '' }</TableCell>",
                default => "<TableCell>{ item.{$columnName} }</TableCell>",
            };
        })->implode("\n");

        $pluralKebabName = $nameFormats['{{ pluralKebabName }}'];
        $cells .= "\n<TableCell className=\"text-right\">
                                            <Button variant=\"outline\" size=\"sm\" asChild>
                                                <Link href={route('{$pluralKebabName}.edit', item.id)}>Edit</Link>
                                            </Button>
                                        </TableCell>";
        $this->updateFileContent($path, '/{\/\* SYNC_TABLE_ROWS_START \*\/}.*?{\/\* SYNC_TABLE_ROWS_END \*\/}/s', "{/* SYNC_TABLE_ROWS_START */}\n{$cells}\n{/* SYNC_TABLE_ROWS_END */}");
    }

    protected function updateReactForm($columns)
    {
        $path = resource_path("js/pages/Features/{$this->featureName}/FormPage.tsx");

        $tsInterfaces = $this->generateTypeScriptInterfaces($columns);
        $this->updateFileContent($path, '/\/\/ SYNC_FORM_ITEM_TYPE_START.*?\/\/ SYNC_FORM_ITEM_TYPE_END/s', "// SYNC_FORM_ITEM_TYPE_START\n{$tsInterfaces}\n    // SYNC_FORM_ITEM_TYPE_END");

        $formDataType = $this->generateTypeScriptInterfaces($columns);
        $formDataValues = collect($columns)->map(function ($col) {
            // Menggabungkan operator langsung ke dalam nilai default
            $defaultValueOperator = match ($col['type']) {
                'int2', 'int4', 'int8', 'integer', 'numeric', 'decimal', 'float4', 'float8' => '?? 0',
                'bool', 'boolean' => '?? false',
                default => "?? ''"
            };
            return "        {$col['name']}: item?.{$col['name']} {$defaultValueOperator},";
        })->implode("\n");
        $this->updateFileContent($path, '/\/\/ SYNC_FORM_DATA_START.*?\/\/ SYNC_FORM_DATA_END/s', "// SYNC_FORM_DATA_START\n    const { data, setData, post, put, processing, errors } = useForm<{\n{$formDataType}\n    }>({
{$formDataValues}\n    });\n    // SYNC_FORM_DATA_END");

        // Update Form Fields
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
                <div className="flex items-center space-x-2">
                    <Checkbox id="{$name}" checked={data.{$name}} onCheckedChange={(checked) => setData('{$name}', !!checked)} />
                    <Label htmlFor="{$name}">{$label}</Label>
                    {errors.{$name} && <p className="text-sm text-red-500 mt-1">{errors.{$name}}</p>}
                </div>
HTML;
            }

            if ($inputType === 'textarea') {
                return <<<HTML
                <div className="space-y-2">
                    <Label htmlFor="{$name}">{$label}</Label>
                    <Textarea id="{$name}" value={data.{$name}} onChange={e => setData('{$name}', e.target.value)} />
                    {errors.{$name} && <p className="text-sm text-red-500 mt-1">{errors.{$name}}</p>}
                </div>
HTML;
            }

            return <<<HTML
            <div className="space-y-2">
                <Label htmlFor="{$name}">{$label}</Label>
                <Input id="{$name}" type="{$inputType}" value={data.{$name}} onChange={e => setData('{$name}', e.target.value)} step="any" />
                {errors.{$name} && <p className="text-sm text-red-500 mt-1">{errors.{$name}}</p>}
            </div>
HTML;
        })->implode("\n");
        $this->updateFileContent($path, '/{\/\* SYNC_FORM_FIELDS_START \*\/}.*?{\/\* SYNC_FORM_FIELDS_END \*\/}/s', "{/* SYNC_FORM_FIELDS_START */}\n{$formFields}\n{/* SYNC_FORM_FIELDS_END */}");
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

    protected function generateTypeScriptInterfaces($columns)
    {
        return collect($columns)->map(function ($col) {
            $tsType = match ($col['type']) {
                'int2', 'int4', 'int8', 'integer', 'numeric', 'decimal', 'float4', 'float8' => 'number',
                'bool', 'boolean' => 'boolean',
                default => 'string',
            };
            return "    {$col['name']}: {$tsType};";
        })->implode("\n");
    }
}
