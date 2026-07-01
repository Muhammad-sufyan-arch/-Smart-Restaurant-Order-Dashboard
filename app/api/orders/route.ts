export type OrderStatus = "Pending" | "Served";

export interface Order {
  id: string;
  customerName: string;
  tableNumber: number;
  items: string;
  totalAmount: number;
  status: OrderStatus;
}

const orders: Order[] = [
  {
    id: "1",
    customerName: "Sarah Mitchell",
    tableNumber: 4,
    items: "Truffle Pasta, Caesar Salad, Red Wine",
    totalAmount: 68.5,
    status: "Pending",
  },
  {
    id: "2",
    customerName: "James Chen",
    tableNumber: 7,
    items: "Grilled Salmon, Mashed Potatoes, Lemonade",
    totalAmount: 42.0,
    status: "Pending",
  },
  {
    id: "3",
    customerName: "Emily Rodriguez",
    tableNumber: 2,
    items: "Margherita Pizza, Tiramisu",
    totalAmount: 31.75,
    status: "Served",
  },
];

let nextId = 4;

export async function GET() {
  return Response.json(orders);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (body.id) {
    const index = orders.findIndex((o) => o.id === body.id);
    if (index === -1) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }
    orders[index] = { ...orders[index], ...body };
    return Response.json(orders[index]);
  }

  const { customerName, tableNumber, items, totalAmount } = body;

  if (!customerName || !tableNumber || !items || totalAmount == null) {
    return Response.json(
      { error: "customerName, tableNumber, items, and totalAmount are required" },
      { status: 400 },
    );
  }

  const newOrder: Order = {
    id: String(nextId++),
    customerName,
    tableNumber: Number(tableNumber),
    items,
    totalAmount: Number(totalAmount),
    status: "Pending",
  };

  orders.push(newOrder);
  return Response.json(newOrder, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Order id is required" }, { status: 400 });
  }

  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  orders.splice(index, 1);
  return Response.json({ success: true });
}
