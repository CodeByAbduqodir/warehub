import { Head, router } from '@inertiajs/react';
import {
    Banknote,
    CreditCard,
    Minus,
    Plus,
    ShoppingCart,
    Trash2,
    X,
    Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@warehub/ui';
import { Input } from '@warehub/ui';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@warehub/ui';
import { cn } from '@warehub/ui';

function CartQtyInput({
    quantity,
    available,
    onChange,
}: {
    quantity: number;
    available: number;
    onChange: (v: number) => void;
}) {
    const [raw, setRaw] = useState(String(quantity));

    function commit(val: string) {
        const n = parseInt(val);

        if (!isNaN(n) && n >= 1) {
            onChange(Math.min(n, available));
        } else {
            setRaw(String(quantity));
        }
    }

    return (
        <input
            type="number"
            min="1"
            max={available}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    commit(raw);
                }
            }}
            onFocus={(e) => e.target.select()}
            className="w-12 [appearance:textfield] border-0 bg-transparent text-center text-sm tabular-nums outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
    );
}

type Customer = { id: number; name: string };
type StockItem = {
    product_id: number;
    product_name: string;
    product_sku: string | null;
    product_barcode: string | null;
    unit: string;
    retail_price: string;
    currency: string;
    available: number;
};
type Props = {
    customers?: Customer[];
    stock?: StockItem[];
};
type CartItem = {
    product_id: number;
    product_name: string;
    unit: string;
    currency: string;
    quantity: number;
    retail_price: number;
    available: number;
};

const QUICK_AMOUNTS = [1000, 5000, 10000, 50000, 100000, 200000];

function fmtAmt(n: number): string {
    return n >= 1000 ? `${n / 1000}к` : String(n);
}

export default function OutgoingPos({ customers = [], stock = [] }: Props) {
    const [customerId, setCustomerId] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [query, setQuery] = useState('');
    const [autoAdd, setAutoAdd] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
    const [received, setReceived] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const searchRef = useRef<HTMLInputElement>(null);

    const availableStock = stock;

    function matchesQuery(s: StockItem) {
        const q = query.toLowerCase();

        return (
            s.product_name.toLowerCase().includes(q) ||
            (s.product_sku?.toLowerCase().includes(q) ?? false) ||
            (s.product_barcode?.toLowerCase().includes(q) ?? false)
        );
    }

    const inStock = availableStock.filter((s) => s.available > 0);
    const outOfStock = availableStock.filter((s) => s.available <= 0);

    const displayItems = query.trim()
        ? [...inStock.filter(matchesQuery), ...outOfStock.filter(matchesQuery)]
        : [...inStock.slice(0, 30), ...outOfStock];

    const total = cart.reduce((sum, i) => sum + i.quantity * i.retail_price, 0);
    const currency = cart[0]?.currency ?? '';
    const receivedNum = parseFloat(received) || 0;
    const change = receivedNum - total;
    const hasReceivedInput = received.trim() !== '';

    function addToCart(item: StockItem, qty = 1) {
        if (item.available <= 0) {
            return;
        }

        setCart((prev) => {
            const idx = prev.findIndex((c) => c.product_id === item.product_id);

            if (idx !== -1) {
                const updated = [...prev];
                updated[idx] = {
                    ...updated[idx],
                    quantity: Math.min(
                        updated[idx].quantity + qty,
                        item.available,
                    ),
                };

                return updated;
            }

            return [
                ...prev,
                {
                    product_id: item.product_id,
                    product_name: item.product_name,
                    unit: item.unit,
                    currency: item.currency,
                    quantity: Math.min(qty, item.available),
                    retail_price: parseFloat(item.retail_price),
                    available: item.available,
                },
            ];
        });
        setError('');
    }

    function focusSearch() {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => searchRef.current?.focus());
        });
    }

    function handleSearchEnter() {
        // Read from DOM directly — barcode scanner fires chars so fast that React state may lag
        const val = (searchRef.current?.value ?? query).trim();

        if (!val) {
            return;
        }

        const byBarcode = availableStock.find((s) => s.product_barcode === val);

        if (byBarcode) {
            if (byBarcode.available <= 0) {
                setError(`«${byBarcode.product_name}» нет в наличии`);
            } else if (autoAdd) {
                addToCart(byBarcode);
            }

            setQuery('');
            focusSearch();
        } else {
            const q = val.toLowerCase();
            const availableMatch = inStock.filter(
                (s) =>
                    s.product_name.toLowerCase().includes(q) ||
                    (s.product_sku?.toLowerCase().includes(q) ?? false) ||
                    (s.product_barcode?.toLowerCase().includes(q) ?? false),
            );

            if (availableMatch.length === 1) {
                addToCart(availableMatch[0]);
                setQuery('');
                focusSearch();
            } else {
                setError(`«${val}» не найден`);
            }
        }
    }

    function setQty(productId: number, qty: number) {
        if (qty <= 0) {
            removeItem(productId);

            return;
        }

        setCart((prev) =>
            prev.map((c) =>
                c.product_id === productId
                    ? { ...c, quantity: Math.min(qty, c.available) }
                    : c,
            ),
        );
    }

    function removeItem(productId: number) {
        setCart((prev) => prev.filter((c) => c.product_id !== productId));
    }

    function handlePay() {
        if (cart.length === 0) {
            setError('Корзина пуста');

            return;
        }

        if (
            paymentMethod === 'cash' &&
            hasReceivedInput &&
            receivedNum < total
        ) {
            setError(
                `Недостаточно: получено ${receivedNum.toLocaleString()}, нужно ${total.toLocaleString()} ${currency}`,
            );

            return;
        }

        setSubmitting(true);
        router.post(
            '/outgoing/pos',
            {
                date: new Date().toISOString().slice(0, 10),
                customer_id: customerId || null,
                items: cart.map((i) => ({
                    product_id: i.product_id,
                    quantity: i.quantity,
                    retail_price: i.retail_price,
                })),
            },
            {
                onSuccess: () => {
                    setCart([]);
                    setQuery('');
                    setCustomerId('');
                    setReceived('');
                    setSubmitting(false);
                    focusSearch();
                },
                onError: (errs) => {
                    setError((Object.values(errs)[0] as string) ?? 'Ошибка');
                    setSubmitting(false);
                },
            },
        );
    }

    function handleClear() {
        setCart([]);
        setError('');
        setReceived('');
        focusSearch();
    }

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'F2') {
                e.preventDefault();
                handlePay();
            }

            if (e.key === 'Escape') {
                e.preventDefault();
                handleClear();
            }
        }
        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    });

    useEffect(() => {
        focusSearch();
    }, [autoAdd, cart, customerId, paymentMethod]);

    return (
        <>
            <Head title="POS-касса" />
            <div className="flex h-screen bg-background text-sm">
                {/* ── Left: product grid ── */}
                <div className="flex flex-1 flex-col overflow-hidden border-r">
                    <div className="flex items-center gap-2 border-b px-4 py-3">
                        <Input
                            ref={searchRef}
                            placeholder="Штрихкод или поиск..."
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setError('');
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearchEnter();
                                }
                            }}
                            className="h-9"
                        />
                        {/* Auto-add toggle */}
                        <button
                            onClick={() => setAutoAdd((v) => !v)}
                            title={
                                autoAdd
                                    ? 'Авто-добавление включено'
                                    : 'Авто-добавление выключено'
                            }
                            className={cn(
                                'flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors',
                                autoAdd
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border text-muted-foreground hover:bg-muted',
                            )}
                        >
                            <Zap className="size-3.5" />
                            Авто
                        </button>
                    </div>

                    <div className="grid flex-1 auto-rows-max grid-cols-2 gap-2 overflow-y-auto p-4 sm:grid-cols-3 lg:grid-cols-4">
                        {displayItems.map((item) => {
                            const inCart =
                                cart.find(
                                    (c) => c.product_id === item.product_id,
                                )?.quantity ?? 0;
                            const outOfStockItem = item.available <= 0;
                            const exhausted =
                                outOfStockItem || inCart >= item.available;

                            return (
                                <button
                                    key={item.product_id}
                                    onClick={() => {
                                        if (!outOfStockItem) {
                                            addToCart(item);
                                            focusSearch();
                                        }
                                    }}
                                    disabled={exhausted}
                                    className={cn(
                                        'flex flex-col rounded-xl border bg-card p-3 text-left transition',
                                        outOfStockItem
                                            ? 'cursor-not-allowed opacity-50'
                                            : 'hover:border-primary hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40',
                                    )}
                                >
                                    <span className="line-clamp-2 leading-snug font-medium">
                                        {item.product_name}
                                    </span>
                                    {item.product_sku && (
                                        <span className="mt-0.5 font-mono text-xs text-muted-foreground">
                                            {item.product_sku}
                                        </span>
                                    )}
                                    <span className="mt-auto pt-2 font-semibold tabular-nums">
                                        {Number(
                                            item.retail_price,
                                        ).toLocaleString()}{' '}
                                        {item.currency}
                                    </span>
                                    {outOfStockItem ? (
                                        <span className="text-xs font-medium text-destructive">
                                            Нет в наличии
                                        </span>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">
                                            {inCart > 0
                                                ? `${inCart} / ${item.available}`
                                                : item.available}{' '}
                                            {item.unit}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                        {displayItems.length === 0 && (
                            <div className="col-span-full flex items-center justify-center py-16 text-muted-foreground">
                                Нет товаров
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right: cart + payment ── */}
                <div className="flex w-80 flex-col lg:w-96">
                    {/* Cart header */}
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
                        <Select
                            value={customerId || 'none'}
                            onValueChange={(v) =>
                                setCustomerId(v === 'none' ? '' : v)
                            }
                        >
                            <SelectTrigger className="h-8 w-36 text-xs">
                                <SelectValue placeholder="Клиент" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">
                                    Без клиента
                                </SelectItem>
                                {customers.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Cart items */}
                    <div className="flex-1 overflow-y-auto">
                        {cart.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                Добавьте товары
                            </div>
                        ) : (
                            <div className="divide-y">
                                {cart.map((item) => (
                                    <div
                                        key={item.product_id}
                                        className="flex items-center gap-2 px-4 py-2.5"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">
                                                {item.product_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground tabular-nums">
                                                {item.retail_price.toLocaleString()}{' '}
                                                × {item.quantity} ={' '}
                                                {(
                                                    item.retail_price *
                                                    item.quantity
                                                ).toLocaleString()}{' '}
                                                {item.currency}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-7"
                                                onClick={() =>
                                                    setQty(
                                                        item.product_id,
                                                        item.quantity - 1,
                                                    )
                                                }
                                            >
                                                <Minus className="size-3" />
                                            </Button>
                                            <CartQtyInput
                                                key={`${item.product_id}-${item.quantity}`}
                                                quantity={item.quantity}
                                                available={item.available}
                                                onChange={(v) =>
                                                    setQty(item.product_id, v)
                                                }
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-7"
                                                onClick={() =>
                                                    setQty(
                                                        item.product_id,
                                                        item.quantity + 1,
                                                    )
                                                }
                                                disabled={
                                                    item.quantity >=
                                                    item.available
                                                }
                                            >
                                                <Plus className="size-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-7 text-destructive hover:text-destructive"
                                                onClick={() =>
                                                    removeItem(item.product_id)
                                                }
                                            >
                                                <Trash2 className="size-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Payment section */}
                    <div className="flex flex-col gap-3 border-t p-4">
                        {/* Payment method */}
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setPaymentMethod('cash')}
                                className={cn(
                                    'flex items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-medium transition-colors',
                                    paymentMethod === 'cash'
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border text-muted-foreground hover:bg-muted',
                                )}
                            >
                                <Banknote className="size-4" /> Наличные
                            </button>
                            <button
                                onClick={() => {
                                    setPaymentMethod('card');
                                    setReceived('');
                                }}
                                className={cn(
                                    'flex items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-medium transition-colors',
                                    paymentMethod === 'card'
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border text-muted-foreground hover:bg-muted',
                                )}
                            >
                                <CreditCard className="size-4" /> Карта
                            </button>
                        </div>

                        {/* Total */}
                        <div className="flex items-baseline justify-between">
                            <span className="text-muted-foreground">Итого</span>
                            <span className="text-2xl font-bold tabular-nums">
                                {total.toLocaleString()} {currency}
                            </span>
                        </div>

                        {/* Cash payment details */}
                        {paymentMethod === 'cash' && (
                            <>
                                {/* Received input */}
                                <div className="flex items-center gap-2">
                                    <span className="shrink-0 text-sm text-muted-foreground">
                                        Получено
                                    </span>
                                    <input
                                        type="number"
                                        value={received}
                                        onChange={(e) => {
                                            setReceived(e.target.value);
                                            setError('');
                                        }}
                                        onFocus={(e) => e.target.select()}
                                        placeholder={
                                            total > 0
                                                ? total.toLocaleString()
                                                : '0'
                                        }
                                        className="min-w-0 flex-1 [appearance:textfield] rounded-lg border px-3 py-1.5 text-right text-base font-semibold tabular-nums transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    />
                                </div>

                                {/* Quick amount buttons */}
                                <div className="flex flex-wrap gap-1">
                                    {QUICK_AMOUNTS.map((amt) => (
                                        <button
                                            key={amt}
                                            onClick={() =>
                                                setReceived(
                                                    String(
                                                        (parseFloat(received) ||
                                                            0) + amt,
                                                    ),
                                                )
                                            }
                                            className="rounded-md border px-2 py-1 text-xs font-medium transition-colors hover:bg-muted"
                                        >
                                            +{fmtAmt(amt)}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() =>
                                            setReceived(String(total))
                                        }
                                        className="rounded-md border bg-muted px-2 py-1 text-xs font-medium"
                                    >
                                        Точно
                                    </button>
                                </div>

                                {/* Change */}
                                {hasReceivedInput && (
                                    <div
                                        className={cn(
                                            'flex items-center justify-between rounded-lg px-3 py-2',
                                            change < 0
                                                ? 'bg-destructive/10'
                                                : 'bg-green-50',
                                        )}
                                    >
                                        <span className="text-sm font-medium">
                                            Сдача
                                        </span>
                                        <span
                                            className={cn(
                                                'text-lg font-bold tabular-nums',
                                                change < 0
                                                    ? 'text-destructive'
                                                    : 'text-green-700',
                                            )}
                                        >
                                            {change.toLocaleString()} {currency}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                                <X className="mt-0.5 size-3 shrink-0" />
                                {error}
                            </div>
                        )}

                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handlePay}
                            disabled={submitting || cart.length === 0}
                        >
                            {submitting
                                ? 'Сохраняем...'
                                : paymentMethod === 'card'
                                  ? 'Оплатить картой (F2)'
                                  : 'Принять оплату (F2)'}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleClear}
                            disabled={cart.length === 0}
                        >
                            Очистить (Esc)
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

OutgoingPos.layout = false;
