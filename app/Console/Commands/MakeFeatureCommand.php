<?php
// app/Console/Commands/MakeFeatureCommand.php

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Str;

class MakeFeatureCommand extends Command
{
    protected $signature = 'make:feature {name}';
    protected $description = 'Create a new CRUD feature (Model, Migration, Controller, Routes, React Components)';

    protected $files;
    protected $featureName; // Contoh: 'ProductCategory'

    public function __construct(Filesystem $files)
    {
        parent::__construct();
        $this->files = $files;
    }

    public function handle()
    {
        $this->featureName = Str::studly($this->argument('name'));

        $this->info("Creating feature: {$this->featureName}...");

        $this->createModel();
        $this->createMigration();
        $this->createController();
        $this->createRoutes();
        $this->createReactComponents();
        $this->registerMenu();
        $this->registerRouteFile();


        $this->info("Feature {$this->featureName} created successfully!");
        $this->warn("Please run 'php artisan migrate' after customizing the migration file.");
        $this->warn("Then, run 'php artisan sync:feature {$this->featureName}' to sync the schema.");
    }

    // Helper untuk mendapatkan path stub
    protected function getStub($type)
    {
        return $this->files->get(base_path("stubs/feature/{$type}.stub"));
    }

    // Helper untuk membuat file dari stub
    protected function createFileFromStub($stubName, $filePath, $placeholders)
    {
        $stub = $this->getStub($stubName);
        $content = str_replace(array_keys($placeholders), array_values($placeholders), $stub);

        $directory = dirname($filePath);
        if (!$this->files->isDirectory($directory)) {
            $this->files->makeDirectory($directory, 0755, true, true);
        }

        $this->files->put($filePath, $content);
        $this->line("File created: {$filePath}");
    }

    // Helper untuk berbagai format nama
    protected function getNameFormats()
    {
        $studly = $this->featureName; // ProductCategory
        return [
            '{{ StudlyName }}'      => $studly,
            '{{ camelName }}'       => Str::camel($studly), // productCategory
            '{{ pluralCamelName }}' => Str::camel(Str::plural($studly)), // productCategories
            '{{ kebabName }}'       => Str::kebab($studly), // product-category
            '{{ pluralKebabName }}' => Str::kebab(Str::plural($studly)), // product-categories
            '{{ snakeName }}'       => Str::snake($studly), // product_category
            '{{ pluralSnakeName }}' => Str::snake(Str::plural($studly)), // product_categories
            '{{ spacedName }}'      => Str::headline($studly), // Product Category
            '{{ pluralSpacedName }}' => Str::headline(Str::plural($studly)), // Product Categories
        ];
    }

    protected function createModel()
    {
        $path = app_path("Features/{$this->featureName}/{$this->featureName}.php");
        $this->createFileFromStub('Model.stub', $path, $this->getNameFormats());
    }

    protected function createMigration()
    {
        $tableName = Str::snake(Str::plural($this->featureName));
        $timestamp = date('Y_m_d_His');
        $path = database_path("migrations/{$timestamp}_create_{$tableName}_table.php");
        $this->createFileFromStub('Migration.stub', $path, $this->getNameFormats());
    }

    protected function createController()
    {
        $path = app_path("Features/{$this->featureName}/{$this->featureName}Controller.php");
        $this->createFileFromStub('Controller.stub', $path, $this->getNameFormats());
    }

    protected function createRoutes()
    {
        $path = base_path("routes/features/{$this->getNameFormats()['{{kebabName}}']}.php");
        $this->createFileFromStub('routes.stub', $path, $this->getNameFormats());
    }

    protected function createReactComponents()
    {
        $basePath = resource_path("js/Pages/Features/{$this->featureName}");
        $this->createFileFromStub('react/Index.jsx.stub', "{$basePath}/Index.jsx", $this->getNameFormats());
        $this->createFileFromStub('react/FormPage.jsx.stub', "{$basePath}/FormPage.jsx", $this->getNameFormats());
    }

    protected function registerMenu()
    {
        // Asumsi ada file config/menu.php untuk mendaftarkan menu sidebar
        $menuConfigPath = config_path('menu.php');
        if ($this->files->exists($menuConfigPath)) {
            $content = $this->files->get($menuConfigPath);
            $menuEntry = "\n    ['label' => '{{ spacedName }}', 'route' => '{{ pluralKebabName }}.index'],";
            $menuEntry = str_replace(array_keys($this->getNameFormats()), array_values($this->getNameFormats()), $menuEntry);

            // Cari posisi sebelum '];' terakhir dan sisipkan
            $pos = strrpos($content, '];');
            if ($pos !== false) {
                $newContent = substr_replace($content, $menuEntry, $pos, 0);
                $this->files->put($menuConfigPath, $newContent);
                $this->line("Menu registered in config/menu.php");
            }
        } else {
            $this->warn("config/menu.php not found. Skipping menu registration.");
        }
    }

    protected function registerRouteFile()
    {
        $routeServiceProviderPath = app_path('Providers/RouteServiceProvider.php');
        $content = $this->files->get($routeServiceProviderPath);

        $routeInclude = "\n\t\t\t\trequire base_path('routes/features/" . $this->getNameFormats()['{{kebabName}}'] . ".php');";

        if (!Str::contains($content, $routeInclude)) {
            // Cari `->group(function () {` dan tambahkan setelahnya
            $pos = strpos($content, '->group(function () {');
            if ($pos !== false) {
                $insertionPoint = $pos + strlen('->group(function () {');
                $newContent = substr_replace($content, $routeInclude, $insertionPoint, 0);
                $this->files->put($routeServiceProviderPath, $newContent);
                $this->line("Route file registered in RouteServiceProvider.");
            }
        }
    }
}
