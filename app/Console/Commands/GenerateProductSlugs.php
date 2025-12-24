<?php

namespace App\Console\Commands;

use App\Features\Product\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class GenerateProductSlugs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'product:generate-slugs';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate slugs for existing products that do not have one.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $products = Product::whereNull('slug')->get();

        if ($products->isEmpty()) {
            $this->info('All products already have slugs. Nothing to do.');
            return;
        }

        $this->info("Generating slugs for {$products->count()} products...");

        foreach ($products as $product) {
            $product->slug = Str::slug($product->nama_produk);
            $product->save();
        }

        $this->info('Successfully generated slugs for all products.');
    }
}
