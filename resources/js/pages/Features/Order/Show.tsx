import { AdminLayout } from '@/layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Order } from '@/types/order';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

type OrderShowProps = PageProps & {
    order: Order;
};

export default function OrderShow({ auth, order }: OrderShowProps) {
    const { data, setData, patch, processing } = useForm({
        order_status: order.order_status,
        estimated_completion_date: order.estimated_completion_date || '',
        admin_notes: order.admin_notes || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('orders.update', order.id));
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title={`Order #${order.id}`} />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Details</CardTitle>
                            <CardDescription>
                                Details for order #{order.id}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="font-medium text-sm">
                                            Order Date
                                        </p>
                                        <p className="text-muted-foreground">
                                            {new Date(
                                                order.created_at,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">
                                            Total Amount
                                        </p>
                                        <p className="text-muted-foreground">
                                            ${order.total_price}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="font-medium text-sm">
                                            Payment Status
                                        </p>
                                        <Badge variant="outline">
                                            {order.payment_status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">
                                            Order Status
                                        </p>
                                        <Badge variant="outline">
                                            {order.order_status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead className="text-right">
                                            Price
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                {item.product.name}
                                            </TableCell>
                                            <TableCell>
                                                {item.quantity}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                ${item.price}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Details</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                            <p className="font-medium">{order.user.name}</p>
                            <p className="text-muted-foreground">
                                {order.user.email}
                            </p>
                            {/* Add more customer details if available */}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Admin Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <Label htmlFor="order_status">
                                        Order Status
                                    </Label>
                                    <Select
                                        value={data.order_status}
                                        onValueChange={(value) =>
                                            setData('order_status', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">
                                                Pending
                                            </SelectItem>
                                            <SelectItem value="processing">
                                                Processing
                                            </SelectItem>
                                            <SelectItem value="shipped">
                                                Shipped
                                            </SelectItem>
                                            <SelectItem value="completed">
                                                Completed
                                            </SelectItem>
                                            <SelectItem value="cancelled">
                                                Cancelled
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="estimated_completion_date">
                                        Estimated Completion Date
                                    </Label>
                                    <Input
                                        id="estimated_completion_date"
                                        type="date"
                                        value={data.estimated_completion_date}
                                        onChange={(e) =>
                                            setData(
                                                'estimated_completion_date',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="admin_notes">
                                        Admin Notes
                                    </Label>
                                    <Textarea
                                        id="admin_notes"
                                        value={data.admin_notes}
                                        onChange={(e) =>
                                            setData('admin_notes', e.target.value)
                                        }
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                >
                                    Save Changes
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
