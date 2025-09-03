<?php

namespace App\Console\Commands;

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



        $this->info("Feature {$this->featureName} created successfully!");
        $this->warn("Please run 'php artisan migrate' after customizing the migration file.");
        $this->warn("Then, run 'php artisan sync:feature {$this->featureName}' to sync the schema.");
    }

    // Helper untuk mendapatkan path stub
    protected function getStub($type)
    {
        return $this->files->get(base_path("stubs/feature/{$type}"));
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
            '{{ lowerPluralSpacedName }}' => Str::lower(Str::headline(Str::plural($studly))),
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
        // Simpan dulu format nama ke dalam variabel
        $nameFormats = $this->getNameFormats();

        // Gunakan variabel tersebut untuk membuat path
        $kebabName = $nameFormats['{{ kebabName }}'];
        $path = base_path("routes/features/{$kebabName}.php");

        $this->createFileFromStub('routes.stub', $path, $nameFormats);
    }

    protected function createReactComponents()
    {
        $basePath = resource_path("js/Pages/Features/{$this->featureName}");
        $this->createFileFromStub('react/Index.tsx.stub', "{$basePath}/Index.tsx", $this->getNameFormats());
        $this->createFileFromStub('react/FormPage.tsx.stub', "{$basePath}/FormPage.tsx", $this->getNameFormats());
    }

    protected function registerMenu()
    {
        // Path menargetkan file TypeScript navigasi Anda
        $navConfigPath = resource_path('js/lib/navigation.ts');

        if (!$this->files->exists($navConfigPath)) {
            $this->warn("{$navConfigPath} not found. Skipping menu registration.");
            return;
        }

        // Template untuk item menu baru yang akan dibuat
        // Menggunakan ikon 'Package' dari lucide-react sebagai default
        $newMenuItem = <<<TS
    {
        title: '{{ pluralSpacedName }}',
        href: route('{{ pluralKebabName }}.index', undefined, false),
        icon: Package,
    },
    // LINK BARU AKAN DITAMBAHKAN SECARA OTOMATIS DI SINI
TS;
        // Mengganti placeholder di template dengan nilai yang benar
        $newMenuItem = str_replace(
            array_keys($this->getNameFormats()),
            array_values($this->getNameFormats()),
            $newMenuItem
        );

        $content = $this->files->get($navConfigPath);

        // Cari komentar penanda untuk menyisipkan item menu baru
        $placeholder = "// LINK BARU AKAN DITAMBAHKAN SECARA OTOMATIS DI SINI";

        if (Str::contains($content, $placeholder)) {
            $newContent = str_replace($placeholder, $newMenuItem, $content);
            $this->files->put($navConfigPath, $newContent);
            $this->line("Menu item for '{$this->getNameFormats()['{{ pluralSpacedName }}']}' registered in {$navConfigPath}");
        } else {
            $this->warn("Placeholder for new links not found in {$navConfigPath}. Skipping.");
        }
    }
}
