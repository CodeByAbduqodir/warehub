import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Trash2, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type Supplier = { id: number; name: string };
type Warehouse = { id: number; name: string };
type Product = {
    id: number;
    name: string;
    sku: string | null;
    barcode: string | null;
    unit: string;
    purchase_price: string;
    currency: string;
};

type Props = {
    suppliers: Supplier[];
    warehouses: Warehouse[];
    products: Product[];
};

type Item = {
    product_id: number;
    product_name: string;
    product_sku: string | null;
    unit: string;
    currency: string;
    quantity: string;
    purchase_price: string;
};

type Header = {
    date: string;
    supplier_id: string;
    warehouse_id: string;
    note: string;
};

const STEPS = ['Шапка', 'Позиции', 'Итог'];

export default function IncomingCreate({ suppliers, warehouses, products }: Props) {
    const [step, setStep] = useState(0);
    const [header, setHeader] = useState<Header>({
        date: new Date().toISOString().slice(0, 10),
        supplier_id: '',
        warehouse_id: warehouses[0] ? String(warehouses[0].id) : '',
        note: '',
    });
    const [items, setItems] = useState<Item[]>([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [barcodeInput, setBarcodeInput] = useState('');
    const [qty, setQty] = useState('1');
    const [price, setPrice] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function validateHeader(): boolean {
        const errs: Record<string, string> = {};
        if (!header.date) errs.date = 'Укажите дату';
        if (!header.warehouse_id) errs.warehouse_id = 'Выберите склад';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    function validateItems(): boolean {
        const errs: Record<string, string> = {};
        if (items.length === 0) errs.items = 'Добавьте хотя бы одну позицию';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    function addItem() {
        const product = products.find((p) => String(p.id) === selectedProductId);
        if (!product) return;

        const parsedQty = parseFloat(qty);
        const parsedPrice = parseFloat(price);
        if (!parsedQty || parsedQty <= 0) return;

        setItems((prev) => [
            ...prev,
            {
                product_id: product.id,
                product_name: product.name,
                product_sku: product.sku,
                unit: product.unit,
                currency: product.currency,
                quantity: String(parsedQty),
                purchase_price: String(parsedPrice || 0),
            },
        ]);

        setSelectedProductId('');
        setBarcodeInput('');
        setQty('1');
        setPrice('');
    }

    function addByBarcode() {
        const product = products.find((p) => p.barcode === barcodeInput.trim());
        if (!product) return;
        setSelectedProductId(String(product.id));
        setPrice(product.purchase_price);
        setBarcodeInput('');
    }

    function removeItem(index: number) {
        setItems((prev) => prev.filter((_, i) => i !== index));
    }

    function handleProductSelect(id: string) {
        setSelectedProductId(id);
        const product = products.find((p) => String(p.id) === id);
        if (product) setPrice(product.purchase_price);
    }

    function handleSubmit() {
        setSubmitting(true);
        router.post(
            '/incoming',
            {
                date: header.date,
                supplier_id: header.supplier_id || null,
                warehouse_id: header.warehouse_id,
                note: header.note || null,
                items: items.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    purchase_price: item.purchase_price,
                })),
            },
            {
                onError: (errs) => {
                    setErrors(errs as Record<string, string>);
                    setSubmitting(false);
                },
            },
        );
    }

    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.quantity) * parseFloat(item.purchase_price), 0);
    const warehouse = warehouses.find((w) => String(w.id) === header.warehouse_id);
    const supplier = suppliers.find((s) => String(s.id) === header.supplier_id);

    return (
        <>
            <Head title="Новый приход" />
            <div className="mx-auto max-w-2xl p-6">
                <h1 className="mb-6 text-lg font-semibold">Новый приход товаров</h1>

                {/* Stepper */}
                <div className="mb-8 flex items-center gap-2">
                    {STEPS.map((label, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div
                                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                                    i < step
                                        ? 'bg-primary text-primary-foreground'
                                        : i === step
                                          ? 'border-2 border-primary text-primary'
                                          : 'border border-muted-foreground/30 text-muted-foreground'
                                }`}
                            >
                                {i < step ? <Check className="size-3.5" /> : i + 1}
                            </div>
                            <span className={`text-sm ${i === step ? 'font-medium' : 'text-muted-foreground'}`}>{label}</span>
                            {i < STEPS.length - 1 && <ChevronRight className="size-4 text-muted-foreground" />}
                        </div>
                    ))}
                </div>

                {/* Step 0: Header */}
                {step === 0 && (
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="date">Дата *</Label>
                            <Input
                                id="date"
                                type="date"
                                value={header.date}
                                onChange={(e) => setHeader((h) => ({ ...h, date: e.target.value }))}
                            />
                            {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="warehouse_id">Склад *</Label>
                            <Select
                                value={header.warehouse_id}
                                onValueChange={(v) => setHeader((h) => ({ ...h, warehouse_id: v }))}
                            >
                                <SelectTrigger id="warehouse_id">
                                    <SelectValue placeholder="Выберите склад" />
                                </SelectTrigger>
                                <SelectContent>
                                    {warehouses.map((w) => (
                                        <SelectItem key={w.id} value={String(w.id)}>
                                            {w.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.warehouse_id && <p className="text-xs text-destructive">{errors.warehouse_id}</p>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="supplier_id">Поставщик</Label>
                            <Select
                                value={header.supplier_id}
                                onValueChange={(v) => setHeader((h) => ({ ...h, supplier_id: v }))}
                            >
                                <SelectTrigger id="supplier_id">
                                    <SelectValue placeholder="Не указан" />
                                </SelectTrigger>
                                <SelectContent>
                                    {suppliers.map((s) => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="note">Примечание</Label>
                            <Textarea
                                id="note"
                                rows={2}
                                value={header.note}
                                onChange={(e) => setHeader((h) => ({ ...h, note: e.target.value }))}
                                placeholder="Комментарий к документу..."
                            />
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <Button
                                onClick={() => {
                                    if (validateHeader()) setStep(1);
                                }}
                            >
                                Далее
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/incoming">Отмена</Link>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 1: Items */}
                {step === 1 && (
                    <div className="flex flex-col gap-5">
                        {/* Barcode scan */}
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="barcode">Штрихкод (сканер)</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="barcode"
                                    value={barcodeInput}
                                    onChange={(e) => setBarcodeInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addByBarcode()}
                                    placeholder="Отсканируйте или введите штрихкод..."
                                />
                                <Button type="button" variant="outline" onClick={addByBarcode}>
                                    Найти
                                </Button>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <p className="mb-3 text-sm font-medium text-muted-foreground">Или выберите товар вручную</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2 flex flex-col gap-1.5">
                                    <Label>Товар</Label>
                                    <Select value={selectedProductId} onValueChange={handleProductSelect}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Выберите товар..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map((p) => (
                                                <SelectItem key={p.id} value={String(p.id)}>
                                                    {p.name}
                                                    {p.sku && ` (${p.sku})`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="qty">Количество</Label>
                                    <Input
                                        id="qty"
                                        type="number"
                                        min="0.001"
                                        step="0.001"
                                        value={qty}
                                        onChange={(e) => setQty(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="price">Цена прихода</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="mt-3"
                                onClick={addItem}
                                disabled={!selectedProductId}
                            >
                                <Plus className="mr-2 size-4" />
                                Добавить позицию
                            </Button>
                        </div>

                        {errors.items && <p className="text-xs text-destructive">{errors.items}</p>}

                        {/* Items table */}
                        {items.length > 0 && (
                            <div className="rounded-xl border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Товар</th>
                                            <th className="px-3 py-2 text-right font-medium text-muted-foreground">Кол-во</th>
                                            <th className="px-3 py-2 text-right font-medium text-muted-foreground">Цена</th>
                                            <th className="px-3 py-2 text-right font-medium text-muted-foreground">Сумма</th>
                                            <th className="px-3 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, i) => (
                                            <tr key={i} className="border-b last:border-0">
                                                <td className="px-3 py-2">
                                                    <div className="font-medium">{item.product_name}</div>
                                                    {item.product_sku && (
                                                        <div className="font-mono text-xs text-muted-foreground">{item.product_sku}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-right tabular-nums">
                                                    {item.quantity} {item.unit}
                                                </td>
                                                <td className="px-3 py-2 text-right tabular-nums">
                                                    {Number(item.purchase_price).toLocaleString()}
                                                </td>
                                                <td className="px-3 py-2 text-right tabular-nums">
                                                    {(parseFloat(item.quantity) * parseFloat(item.purchase_price)).toLocaleString()} {item.currency}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => removeItem(i)}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="flex items-center gap-3 pt-2">
                            <Button
                                onClick={() => {
                                    if (validateItems()) setStep(2);
                                }}
                            >
                                Далее
                            </Button>
                            <Button variant="outline" onClick={() => setStep(0)}>
                                Назад
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Summary */}
                {step === 2 && (
                    <div className="flex flex-col gap-6">
                        <div className="rounded-xl border p-4 flex flex-col gap-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Дата</span>
                                <span className="font-medium">{new Date(header.date).toLocaleDateString('ru-RU')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Склад</span>
                                <span className="font-medium">{warehouse?.name}</span>
                            </div>
                            {supplier && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Поставщик</span>
                                    <span className="font-medium">{supplier.name}</span>
                                </div>
                            )}
                            {header.note && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Примечание</span>
                                    <span className="font-medium">{header.note}</span>
                                </div>
                            )}
                        </div>

                        <div className="rounded-xl border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Товар</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Кол-во</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Цена</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Сумма</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, i) => (
                                        <tr key={i} className="border-b last:border-0">
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{item.product_name}</div>
                                                {item.product_sku && (
                                                    <div className="font-mono text-xs text-muted-foreground">{item.product_sku}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums">
                                                {item.quantity} {item.unit}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums">
                                                {Number(item.purchase_price).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums">
                                                {(parseFloat(item.quantity) * parseFloat(item.purchase_price)).toLocaleString()} {item.currency}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t bg-muted/30">
                                        <td colSpan={3} className="px-4 py-3 text-right font-medium">Итого:</td>
                                        <td className="px-4 py-3 text-right font-semibold tabular-nums">
                                            {totalAmount.toLocaleString()}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {Object.keys(errors).length > 0 && (
                            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                Исправьте ошибки и попробуйте снова.
                            </div>
                        )}

                        <div className="flex items-center gap-3 pt-2">
                            <Button onClick={handleSubmit} disabled={submitting}>
                                {submitting ? 'Сохраняем...' : 'Сохранить документ'}
                            </Button>
                            <Button variant="outline" onClick={() => setStep(1)}>
                                Назад
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

IncomingCreate.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Приход', href: '/incoming' },
        { title: 'Новый приход', href: '/incoming/create' },
    ],
};
