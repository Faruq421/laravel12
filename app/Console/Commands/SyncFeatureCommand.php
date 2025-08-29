<?php

// app/Console/Commands/SyncFeatureCommand.php

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
        $path = resource_path("js/Pages/Features/{$this->featureName}/Index.jsx");

        // Update Table Headers
        $headers = "<th class=\"px-4 py-2 w-20\">ID</th>\n";
        $headers .= collect($columns)->map(fn($col) => "<th class=\"px-4 py-2\">" . Str::headline($col['name']) . "</th>")->implode("\n");
        $headers .= "\n<th class=\"px-4 py-2\">Action</th>";
        $this->updateFileContent($path, '/{\/\* SYNC_TABLE_HEADERS_START \*\/}.*?{\/\* SYNC_TABLE_HEADERS_END \*\/}/s', "{/* SYNC_TABLE_HEADERS_START */}\n{$headers}\n{/* SYNC_TABLE_HEADERS_END */}");

        // Update Table Rows
        $rowVars = 'id, ' . collect($columns)->pluck('name')->implode(', ');
        $cells = "<td className=\"border px-4 py-2\">{ id }</td>\n";
        $cells .= collect($columns)->map(function ($col) {
            if ($col['type'] === 'bool' || $col['type'] === 'boolean') {
                return "<td className=\"border px-4 py-2\">{ {$col['name']} ? 'Yes' : 'No' }</td>";
            }
            return "<td className=\"border px-4 py-2\">{ {$col['name']} }</td>";
        })->implode("\n");
        $this->updateFileContent($path, '/\{items\.data\.map\(\(\{.*?\}\)\s*=>\s*\(/s', "{items.data.map(({ $rowVars }) => (");
        $this->updateFileContent($path, '/{\/\* SYNC_TABLE_ROWS_START \*\/}.*?{\/\* SYNC_TABLE_ROWS_END \*\/}/s', "{/* SYNC_TABLE_ROWS_START */}\n{$cells}\n{/* SYNC_TABLE_ROWS_END */}");
    }

    protected function updateReactForm($columns)
    {
        $path = resource_path("js/Pages/Features/{$this->featureName}/FormPage.jsx");

        // Update useForm data
        $formData = collect($columns)->map(function ($col) {
            $defaultValue = match ($col['type']) {
                'int2', 'int4', 'int8', 'integer', 'numeric', 'decimal' => '0',
                'bool', 'boolean' => '?? true', // Use ?? for existing items
                default => "|| ''"
            };
            return "{$col['name']}: item?.{$col['name']} {$defaultValue},";
        })->implode("\n        ");
        $this->updateFileContent($path, '/{\/\* SYNC_FORM_DATA_START \*\/}.*?{\/\* SYNC_FORM_DATA_END \*\/}/s', "{/* SYNC_FORM_DATA_START */}\n    const { data, setData, post, put, processing, errors } = useForm({\n        {$formData}\n    });\n    {/* SYNC_FORM_DATA_END */}");

        // Update Form Fields
        $formFields = collect($columns)->map(function ($col) {
            $label = Str::headline($col['name']);
            $inputType = match ($col['type']) {
                'int2', 'int4', 'int8', 'integer' => 'number',
                'float4', 'float8', 'numeric', 'decimal' => 'number',
                'date', 'datetime', 'timestamp' => 'date',
                'text' => 'textarea',
                'bool', 'boolean' => 'select',
                default => 'text'
            };

            if ($inputType === 'select') {
                return <<<HTML
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="{$col['name']}">{$label}</label>
                    <select id="{$col['name']}" value={data.{$col['name']}} onChange={e => setData('{$col['name']}', e.target.value === 'true')} className="shadow border rounded w-full py-2 px-3">
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                    </select>
                    {errors.{$col['name']} && <div className="text-red-500 text-xs mt-1">{errors.{$col['name']}}</div>}
                </div>
                HTML;
            }

            if ($inputType === 'textarea') {
                return <<<HTML
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="{$col['name']}">{$label}</label>
                    <textarea id="{$col['name']}" value={data.{$col['name']}} onChange={e => setData('{$col['name']}', e.target.value)} className="shadow border rounded w-full py-2 px-3"></textarea>
                    {errors.{$col['name']} && <div className="text-red-500 text-xs mt-1">{errors.{$col['name']}}</div>}
                </div>
                HTML;
            }

            return <<<HTML
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="{$col['name']}">{$label}</label>
                <input id="{$col['name']}" type="{$inputType}" value={data.{$col['name']}} onChange={e => setData('{$col['name']}', e.target.value)} className="shadow border rounded w-full py-2 px-3" />
                {errors.{$col['name']} && <div className="text-red-500 text-xs mt-1">{errors.{$col['name']}}</div>}
            </div>
            HTML;
        })->implode("\n");
        $this->updateFileContent($path, '/{\/\* SYNC_FORM_FIELDS_START \*\/}.*?{\/\* SYNC_FORM_FIELDS_END \*\/}/s', "{/* SYNC_FORM_FIELDS_START */}\n{$formFields}\n{/* SYNC_FORM_FIELDS_END */}");
    }
}
