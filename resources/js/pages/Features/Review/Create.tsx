import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import SiteLayout from '@/layouts/SiteLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, ArrowLeft, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface ReviewProduct {
    id: number;
    name: string;
    image_url: string;
    variant: string;
}

interface Props {
    order: {
        id: number;
        created_at: string;
    };
    products: ReviewProduct[];
    existingReviews?: Record<number, { rating: number; comment?: string }>;
}

export default function Create({ order, products, existingReviews = {} }: Props) {
    // State for managing ratings and comments for each product
    const [reviews, setReviews] = useState<Record<number, { rating: number; comment: string }>>(() => {
        // Initialize state with existing reviews if available
        const initialState: Record<number, { rating: number; comment: string }> = {};

        // Default empty state
        products.forEach(p => {
            initialState[p.id] = { rating: 0, comment: '' };
        });

        // Override with existing reviews
        Object.entries(existingReviews).forEach(([productId, review]) => {
            initialState[parseInt(productId)] = {
                rating: review.rating,
                comment: review.comment || ''
            };
        });

        return initialState;
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check if we are updating or creating
    const isUpdate = Object.keys(existingReviews).length > 0;

    const handleRatingChange = (productId: number, rating: number) => {
        setReviews(prev => ({
            ...prev,
            [productId]: { ...prev[productId], rating, comment: prev[productId]?.comment || '' }
        }));
    };

    const handleCommentChange = (productId: number, comment: string) => {
        setReviews(prev => ({
            ...prev,
            [productId]: { ...prev[productId], comment, rating: prev[productId]?.rating || 0 }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate at least one review has rating
        const validReviews = Object.entries(reviews).filter(([_, r]) => r.rating > 0);
        if (validReviews.length === 0) {
            toast.error('Silakan berikan rating minimal untuk satu produk.');
            return;
        }

        setIsSubmitting(true);

        // Transform reviews to include product_id in each review object
        const reviewsData: Record<number, { product_id: number; rating: number; comment: string }> = {};
        for (const [productId, review] of Object.entries(reviews)) {
            if (review.rating > 0) {
                reviewsData[parseInt(productId)] = {
                    product_id: parseInt(productId),
                    rating: review.rating,
                    comment: review.comment || '',
                };
            }
        }

        router.post(route('reviews.store'), {
            order_id: order.id,
            reviews: reviewsData,
        }, {
            onSuccess: () => {
                toast.success('Terima kasih! Penilaian Anda telah disimpan.');
            },
            onError: (errors) => {
                console.error('Submit error:', errors);
                toast.error('Gagal menyimpan penilaian. Silakan coba lagi.');
                setIsSubmitting(false);
            },
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    return (
        <SiteLayout>
            <Head title={`Beri Penilaian - Order #${order.id}`} />

            <div className="container mx-auto py-8 max-w-3xl px-4">
                <Button variant="ghost" asChild className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
                    <Link href={route('orders.my')} className="flex items-center gap-2 text-muted-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Pesanan Saya
                    </Link>
                </Button>

                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Beri Penilaian Produk</h1>
                        <p className="text-muted-foreground">
                            Pesanan #{order.id} • {formatDate(order.created_at)}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {products.map((product) => (
                            <Card key={product.id}>
                                <CardContent className="p-6">
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        {/* Product Info */}
                                        <div className="flex-shrink-0">
                                            <div className="h-24 w-24 rounded-md bg-slate-100 border flex items-center justify-center overflow-hidden">
                                                <img
                                                    src={product.image_url || '/images/placeholder-product.png'}
                                                    onError={(e) => e.currentTarget.src = 'https://placehold.co/100x100?text=Produk'}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        </div>

                                        {/* Review Inputs */}
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <h3 className="font-semibold text-lg">{product.name}</h3>
                                                <p className="text-sm text-muted-foreground">{product.variant}</p>
                                            </div>

                                            <Separator />

                                            {/* Rating Stars */}
                                            <div className="space-y-2">
                                                <Label>Kualitas Produk</Label>
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => handleRatingChange(product.id, star)}
                                                            className={`p-1 transition-colors ${(reviews[product.id]?.rating || 0) >= star
                                                                ? 'text-yellow-400'
                                                                : 'text-slate-200 hover:text-yellow-200'
                                                                }`}
                                                        >
                                                            <Star className="h-8 w-8 fill-current" />
                                                        </button>
                                                    ))}
                                                    <span className="ml-2 text-sm font-medium text-muted-foreground">
                                                        {reviews[product.id]?.rating ?
                                                            ['Sangat Buruk', 'Buruk', 'Cukup', 'Baik', 'Sangat Baik'][reviews[product.id].rating - 1]
                                                            : 'Pilih Bintang'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Comment */}
                                            <div className="space-y-2">
                                                <Label>Ulasan Anda (Opsional)</Label>
                                                <Textarea
                                                    placeholder="Bagaimana kualitas produk ini? Apakah sesuai dengan ekspektasi Anda?"
                                                    value={reviews[product.id]?.comment || ''}
                                                    onChange={(e) => handleCommentChange(product.id, e.target.value)}
                                                    className="resize-none"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        <div className="flex justify-end pt-4">
                            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    isUpdate ? 'Perbarui Penilaian' : 'Kirim Penilaian'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </SiteLayout>
    );
}

