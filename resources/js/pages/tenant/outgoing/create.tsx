import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Check, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type Customer = { id: number; name: string };
type Warehouse = { id: number; name: string };
type StockItem = {
    product_id: number; product_name: string; product_sku: string | null; product_barcode: string | null;
    unit: string; retail_price: string; currency: string; available: number; warehouse_id: number;
};
type Props = { customers: Customer[]; warehouses: Warehouse[]; stock: StockItem[] };

type CartItem = { product_id: number; product_name: string; product_sku: string | null; unit: string; currency: string; quantity: string; retail_price: string; available: number };
type Header = { date: string; customer_id: string; warehouse_id: string; note: string };

const STEPS = ['Шапка', 'Товары', 'Итог'];

export default function OutgoingCreate({ customers, warehouses, stock }: Props) {
    const [step, setStep] = useState(0);
    const [header, setHeader] = useState<Header>({
        date: new Date().toISOString().slice(0, 10),
        customer_id: '',
        warehouse_id: warehouses[0] ? String(warehouses[0].id) : '',
        note: '',
    });
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [barcodeInput, setBarcodeInput] = useState('');
    const [qty, setQty] = useState('1');
    const [price, setPrice] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const availableStock = stock.filter((s) => !header.warehouse_id || String(s.warehouse_id) === header.warehouse_id);

    function addItem(productId: string) {
        const item = availableStock.find((s) => String(s.product_id) === productId);
        if (!item) return;
        const parsedQty = parseFloat(qty);
        if (!parsedQty || parsedQty <= 0) return;
        setCart((prev) => [...prev, {
            product_id: item.product_id, product_name: item.product_name, product_sku: item.product_sku,
            unit: item.unit, currency: item.currency, quantity: String(parsedQty),
            retail_price: price || item.retail_price, available: item.available,
        }]);
        setSelectedProductId(''); setBarcodeInput(''); setQty('1'); setPrice('');
    }

    function addByBarcode() {
        const item = availableStock.find((s) => s.product_barcode === barcodeInput.trim());
        if (!item) return;
        setSelectedProductId(String(item.product_id));
        setPrice(item.retail_price);
        setBarcodeInput('');
    }

    function handleProductSelect(id: string) {
        setSelectedProductId(id);
        const item = availableStock.find((s) => String(s.product_id) === id);
        if (item) setPrice(item.retail_price);
    }

    function validateHeader() {
        const errs: Record<string, string> = {};
        if (!header.date) errs.date = 'Укажите дату';
        if (!header.warehouse_id) errs.warehouse_id = 'Выберите склад';
        setErrors(errs); return Object.keys(errs).length === 0;
    }
    function validateCart() {
        const errs: Record<string, string> = {};
        if (cart.length === 0) errs.items = 'Добавьте хотя бы один товар';
        setErrors(errs); return Object.keys(errs).length === 0;
    }

    function handleSubmit() {
        setSubmitting(true);
        router.post('/outgoing', {
            date: header.date, customer_id: header.customer_id || null,
            warehouse_id: header.warehouse_id, note: header.note || null,
            items: cart.map((i) => ({ product_id: i.product_id, quantity: i.quantity, retail_price: i.retail_price })),
        }, { onError: (errs) => { setErrors(errs as Record<string, string>); setSubmitting(false); } });
    }

    const totalAmount = cart.reduce((sum, i) => sum + parseFloat(i.quantity) * parseFloat(i.retail_price), 0);
    const warehouse = warehouses.find((w) => String(w.id) === header.warehouse_id);
    const customer = customers.find((c) => String(c.id) === header.customer_id);

    return (
        <>
            <Head title="Новая продажа" />
            <div className="mx-auto max-w-2xl p-6">
                <h1 className="mb-6 text-lg font-semibold">Новая продажа</h1>

                <div className="mb-8 flex items-center gap-2">
                    {STEPS.map((label, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${i < step ? 'bg-primary text-primary-foreground' : i === step ? 'border-2 border-primary text-primary' : 'border border-muted-foreground/30 text-muted-foreground'}`}>
                                {i < step ? <Check className="size-3.5" /> : i + 1}
                            </div>
                            <span className={`text-sm ${i === step ? 'font-medium' : 'text-muted-foreground'}`}>{label}</span>
                            {i < STEPS.length - 1 && <ChevronRight className="size-4 text-muted-foreground" />}
                        </div>
                    ))}
                </div>

                {step === 0 && (
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="date">Дата *</Label>
                            <Input id="date" type="date" value={header.date} onChange={(e) => setHeader((h) => ({ ...h, date: e.target.value }))} />
                            {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Склад *</Label>
                            <Select value={header.warehouse_id} onValueChange={(v) => setHeader((h) => ({ ...h, warehouse_id: v }))}>
                                <SelectTrigger><SelectValue placeholder="Выберите склад" /></SelectTrigger>
                                <SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>)}</SelectContent>
                            </Select>
                            {errors.warehouse_id && <p className="text-xs text-destructive">{errors.warehouse_id}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Клиент</Label>
                            <Select value={header.customer_id} onValueChange={(v) => setHeader((h) => ({ ...h, customer_id: v }))}>
                                <SelectTrigger><SelectValue placeholder="Не указан" /></SelectTrigger>
                                <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Примечание</Label>
                            <Textarea rows={2} value={header.note} onChange={(e) => setHeader((h) => ({ ...h, note: e.target.value }))} />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button onClick={() => { if (validateHeader()) setStep(1); }}>Далее</Button>
                            <Button variant="outline" asChild><Link href="/outgoing">Отмена</Link></Button>
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1.5">
                            <Label>Штрихкод (сканер)</Label>
                            <div className="flex gap-2">
                                <Input value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addByBarcode()} placeholder="Отсканируйте штрихкод..." />
                                <Button type="button" variant="outline" onClick={addByBarcode}>Найти</Button>
                            </div>
                        </div>
                        <div className="border-t pt-4">
                            <p className="mb-3 text-sm font-medium text-muted-foreground">Или выберите вручную</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2 flex flex-col gap-1.5">
                                    <Label>Товар</Label>
                                    <Select value={selectedProductId} onValueChange={handleProductSelect}>
                                        <SelectTrigger><SelectValue placeholder="Выберите товар..." /></SelectTrigger>
                                        <SelectContent>
                                            {availableStock.map((s) => (
                                                <SelectItem key={s.product_id} value={String(s.product_id)}>
                                                    {s.product_name}{s.product_sku && ` (${s.product_sku})`} — {s.available} {s.unit}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label>Количество</Label>
                                    <Input type="number" min="0.001" step="0.001" value={qty} onChange={(e) => setQty(e.target.value)} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label>Цена продажи</Label>
                                    <Input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
                                </div>
                            </div>
                            <Button type="button" variant="outline" className="mt-3" onClick={() => addItem(selectedProductId)} disabled={!selectedProductId}>
                                <Plus className="mr-2 size-4" />Добавить
                            </Button>
                        </div>
                        {errors.items && <p className="text-xs text-destructive">{errors.items}</p>}
                        {cart.length > 0 && (
                            <div className="rounded-xl border">
                                <table className="w-full text-sm">
                                    <thead><tr className="border-b bg-muted/50">
                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Товар</th>
                                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Кол-во</th>
                                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Цена</th>
                                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Сумма</th>
                                        <th className="px-3 py-2"></th>
                                    </tr></thead>
                                    <tbody>
                                        {cart.map((item, i) => (
                                            <tr key={i} className="border-b last:border-0">
                                                <td className="px-3 py-2">
                                                    <div className="font-medium">{item.product_name}</div>
                                                    {item.product_sku && <div className="font-mono text-xs text-muted-foreground">{item.product_sku}</div>}
                                                </td>
                                                <td className="px-3 py-2 text-right tabular-nums">{item.quantity} {item.unit}</td>
                                                <td className="px-3 py-2 text-right tabular-nums">{Number(item.retail_price).toLocaleString()}</td>
                                                <td className="px-3 py-2 text-right tabular-nums">{(parseFloat(item.quantity) * parseFloat(item.retail_price)).toLocaleString()} {item.currency}</td>
                                                <td className="px-3 py-2">
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setCart((prev) => prev.filter((_, j) => j !== i))}>
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="flex gap-3 pt-2">
                            <Button onClick={() => { if (validateCart()) setStep(2); }}>Далее</Button>
                            <Button variant="outline" onClick={() => setStep(0)}>Назад</Button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="flex flex-col gap-6">
                        <div className="rounded-xl border p-4 flex flex-col gap-3 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Дата</span><span className="font-medium">{new Date(header.date).toLocaleDateString('ru-RU')}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Склад</span><span className="font-medium">{warehouse?.name}</span></div>
                            {customer && <div className="flex justify-between"><span className="text-muted-foreground">Клиент</span><span className="font-medium">{customer.name}</span></div>}
                        </div>
                        <div className="rounded-xl border">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Товар</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Кол-во</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Цена</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Сумма</th>
                                </tr></thead>
                                <tbody>
                                    {cart.map((item, i) => (
                                        <tr key={i} className="border-b last:border-0">
                                            <td className="px-4 py-3"><div className="font-medium">{item.product_name}</div></td>
                                            <td className="px-4 py-3 text-right tabular-nums">{item.quantity} {item.unit}</td>
                                            <td className="px-4 py-3 text-right tabular-nums">{Number(item.retail_price).toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right tabular-nums">{(parseFloat(item.quantity) * parseFloat(item.retail_price)).toLocaleString()} {item.currency}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot><tr className="border-t bg-muted/30">
                                    <td colSpan={3} className="px-4 py-3 text-right font-medium">Итого:</td>
                                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{totalAmount.toLocaleString()}</td>
                                </tr></tfoot>
                            </table>
                        </div>
                        {Object.keys(errors).length > 0 && (
                            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                {errors.items || 'Исправьте ошибки и попробуйте снова.'}
                            </div>
                        )}
                        <div className="flex gap-3 pt-2">
                            <Button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Сохраняем...' : 'Сохранить документ'}</Button>
                            <Button variant="outline" onClick={() => setStep(1)}>Назад</Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

OutgoingCreate.layout = {
    breadcrumbs: [{ title: 'Дашборд', href: '/' }, { title: 'Продажи', href: '/outgoing' }, { title: 'Новая продажа', href: '/outgoing/create' }],
};
