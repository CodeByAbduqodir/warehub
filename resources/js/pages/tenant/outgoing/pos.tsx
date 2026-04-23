import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Customer = { id: number; name: string };
type Warehouse = { id: number; name: string };
type StockItem = {
    product_id: number; product_name: string; product_sku: string | null; product_barcode: string | null;
    unit: string; retail_price: string; currency: string; available: number; warehouse_id: number;
};
type Props = { customers: Customer[]; warehouses: Warehouse[]; stock: StockItem[] };
type CartItem = { product_id: number; product_name: string; unit: string; currency: string; quantity: number; retail_price: number };

export default function OutgoingPos({ customers, warehouses, stock }: Props) {
    const [warehouseId, setWarehouseId] = useState(warehouses[0] ? String(warehouses[0].id) : '');
    const [customerId, setCustomerId] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [search, setSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const barcodeRef = useRef<HTMLInputElement>(null);

    const availableStock = stock.filter((s) => !warehouseId || String(s.warehouse_id) === warehouseId);
    const filtered = search.trim()
        ? availableStock.filter((s) =>
            s.product_name.toLowerCase().includes(search.toLowerCase()) ||
            (s.product_sku && s.product_sku.toLowerCase().includes(search.toLowerCase()))
        )
        : availableStock.slice(0, 30);

    const total = cart.reduce((sum, i) => sum + i.quantity * i.retail_price, 0);
    const currency = cart[0]?.currency ?? '';

    function addToCart(item: StockItem, qty = 1) {
        setCart((prev) => {
            const idx = prev.findIndex((c) => c.product_id === item.product_id);
            if (idx !== -1) {
                const updated = [...prev];
                updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + qty };
                return updated;
            }
            return [...prev, {
                product_id: item.product_id, product_name: item.product_name,
                unit: item.unit, currency: item.currency,
                quantity: qty, retail_price: parseFloat(item.retail_price),
            }];
        });
        setError('');
    }

    function addByBarcode() {
        const val = barcodeInput.trim();
        if (!val) return;
        const item = availableStock.find((s) => s.product_barcode === val);
        if (item) { addToCart(item); } else { setError(`Штрихкод «${val}» не найден`); }
        setBarcodeInput('');
    }

    function setQty(productId: number, qty: number) {
        if (qty <= 0) { removeItem(productId); return; }
        setCart((prev) => prev.map((c) => c.product_id === productId ? { ...c, quantity: qty } : c));
    }

    function removeItem(productId: number) {
        setCart((prev) => prev.filter((c) => c.product_id !== productId));
    }

    function handlePay() {
        if (cart.length === 0) { setError('Корзина пуста'); return; }
        setSubmitting(true);
        router.post('/outgoing', {
            date: new Date().toISOString().slice(0, 10),
            warehouse_id: warehouseId,
            customer_id: customerId || null,
            items: cart.map((i) => ({ product_id: i.product_id, quantity: i.quantity, retail_price: i.retail_price })),
        }, {
            onSuccess: () => { setCart([]); setSubmitting(false); },
            onError: (errs) => {
                setError(Object.values(errs)[0] as string ?? 'Ошибка');
                setSubmitting(false);
            },
        });
    }

    function handleClear() { setCart([]); setError(''); }

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'F2') { e.preventDefault(); handlePay(); }
            if (e.key === 'Escape') { e.preventDefault(); handleClear(); }
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });

    useEffect(() => { barcodeRef.current?.focus(); }, []);

    return (
        <>
            <Head title="POS-касса" />
            <div className="flex h-screen bg-background text-sm">
                {/* Left: product list */}
                <div className="flex flex-1 flex-col overflow-hidden border-r">
                    <div className="flex items-center gap-2 border-b px-4 py-3">
                        <Input
                            ref={barcodeRef}
                            placeholder="Штрихкод или поиск..."
                            value={barcodeInput || search}
                            onChange={(e) => {
                                const v = e.target.value;
                                setBarcodeInput('');
                                setSearch(v);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    if (barcodeInput) { addByBarcode(); }
                                    else if (search && filtered.length === 1) { addToCart(filtered[0]); setSearch(''); }
                                }
                            }}
                            onInput={(e) => {
                                const v = (e.target as HTMLInputElement).value;
                                const isBarcode = /^[A-Za-z0-9\-]+$/.test(v) && v.length >= 4;
                                if (isBarcode) setBarcodeInput(v);
                            }}
                            className="h-9"
                        />
                        {warehouses.length > 1 && (
                            <Select value={warehouseId} onValueChange={(v) => { setWarehouseId(v); setCart([]); }}>
                                <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
                                <SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>)}</SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="grid flex-1 auto-rows-max grid-cols-2 gap-2 overflow-y-auto p-4 sm:grid-cols-3 lg:grid-cols-4">
                        {filtered.map((item) => (
                            <button
                                key={item.product_id}
                                onClick={() => addToCart(item)}
                                disabled={item.available <= 0}
                                className="flex flex-col rounded-xl border bg-card p-3 text-left transition hover:border-primary hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <span className="line-clamp-2 font-medium leading-snug">{item.product_name}</span>
                                {item.product_sku && <span className="mt-0.5 font-mono text-xs text-muted-foreground">{item.product_sku}</span>}
                                <span className="mt-auto pt-2 font-semibold tabular-nums">{Number(item.retail_price).toLocaleString()} {item.currency}</span>
                                <span className="text-xs text-muted-foreground">{item.available} {item.unit}</span>
                            </button>
                        ))}
                        {filtered.length === 0 && (
                            <div className="col-span-full flex items-center justify-center py-16 text-muted-foreground">
                                Нет товаров
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: cart */}
                <div className="flex w-80 flex-col lg:w-96">
                    <div className="flex items-center justify-between border-b px-4 py-3">
                        <div className="flex items-center gap-2 font-semibold">
                            <ShoppingCart className="size-4" />
                            Корзина
                            {cart.length > 0 && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                    {cart.length}
                                </span>
                            )}
                        </div>
                        <Select value={customerId} onValueChange={setCustomerId}>
                            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Клиент" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Без клиента</SelectItem>
                                {customers.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {cart.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                Добавьте товары
                            </div>
                        ) : (
                            <div className="divide-y">
                                {cart.map((item) => (
                                    <div key={item.product_id} className="flex items-center gap-2 px-4 py-2.5">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">{item.product_name}</p>
                                            <p className="text-xs text-muted-foreground tabular-nums">
                                                {item.retail_price.toLocaleString()} × {item.quantity} = {(item.retail_price * item.quantity).toLocaleString()} {item.currency}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="size-7" onClick={() => setQty(item.product_id, item.quantity - 1)}>
                                                <Minus className="size-3" />
                                            </Button>
                                            <span className="w-6 text-center tabular-nums">{item.quantity}</span>
                                            <Button variant="ghost" size="icon" className="size-7" onClick={() => setQty(item.product_id, item.quantity + 1)}>
                                                <Plus className="size-3" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive" onClick={() => removeItem(item.product_id)}>
                                                <Trash2 className="size-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-t p-4">
                        {error && (
                            <div className="mb-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                                <X className="mt-0.5 size-3 shrink-0" />
                                {error}
                            </div>
                        )}
                        <div className="mb-4 flex items-baseline justify-between">
                            <span className="text-muted-foreground">Итого</span>
                            <span className="text-2xl font-bold tabular-nums">{total.toLocaleString()} {currency}</span>
                        </div>
                        <Button className="w-full" size="lg" onClick={handlePay} disabled={submitting || cart.length === 0}>
                            {submitting ? 'Сохраняем...' : 'Оплатить (F2)'}
                        </Button>
                        <Button variant="outline" className="mt-2 w-full" onClick={handleClear} disabled={cart.length === 0}>
                            Очистить (Esc)
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

OutgoingPos.layout = false;
