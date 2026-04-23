import { Head, Link, router } from '@inertiajs/react';
import { PackageSearch, Plus, Search, Trash2, Pencil } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Category = {
    id: number;
    name: string;
};

type Product = {
    id: number;
    sku: string | null;
    barcode: string | null;
    name: string;
    brand: string | null;
    unit: string;
    purchase_price: string;
    retail_price: string;
    currency: string;
    min_stock: number;
    category: Category | null;
    created_at: string;
};

type PaginatedProducts = {
    data: Product[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
};

type Props = {
    products: PaginatedProducts;
};

export default function ProductsIndex({ products }: Props) {
    const [search, setSearch] = useState('');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/products', { search }, { preserveState: true });
    }

    function handleDelete(product: Product) {
        if (confirm(`Удалить товар "${product.name}"?`)) {
            router.delete(`/products/${product.id}`);
        }
    }

    return (
        <>
            <Head title="Товары" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">Товары</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">{products.total} позиций</p>
                    </div>
                    <Button asChild>
                        <Link href="/products/create">
                            <Plus className="mr-2 size-4" />
                            Добавить товар
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Поиск по названию, SKU, штрихкоду..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Button type="submit" variant="outline">Найти</Button>
                </form>

                {products.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
                        <PackageSearch className="size-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Товары не найдены</p>
                        <Button asChild size="sm">
                            <Link href="/products/create">Добавить первый товар</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="rounded-xl border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Название</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">SKU</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Категория</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ед.</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Розничная цена</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.data.map((product) => (
                                        <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30">
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{product.name}</div>
                                                {product.brand && (
                                                    <div className="text-xs text-muted-foreground">{product.brand}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                                {product.sku ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {product.category?.name ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{product.unit}</td>
                                            <td className="px-4 py-3 text-right tabular-nums">
                                                {Number(product.retail_price).toLocaleString()} {product.currency}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/products/${product.id}/edit`}>
                                                            <Pencil className="size-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(product)}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {products.last_page > 1 && (
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>Страница {products.current_page} из {products.last_page}</span>
                                <div className="flex gap-2">
                                    {products.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.get('/products', { page: products.current_page - 1 })}
                                        >
                                            Назад
                                        </Button>
                                    )}
                                    {products.current_page < products.last_page && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.get('/products', { page: products.current_page + 1 })}
                                        >
                                            Вперёд
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

ProductsIndex.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Товары', href: '/products' },
    ],
};
