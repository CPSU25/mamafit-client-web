// src/pages/admin/manage-transaction.tsx
// Yêu cầu: tailwindcss + shadcn/ui + lucide-react + recharts
// pnpm add recharts lucide-react
import { useMemo, useState } from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Eye, Pencil, Trash2, Download } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
  BarChart, Bar,
} from "recharts";
import clsx from "clsx";

type TxStatus = "Success" | "Failed";
type PayMode =
  | "Gift Card"
  | "Coupon"
  | "COD"
  | "UPI"
  | "Debit Card"
  | "Cash";

type Transaction = {
  id: string;
  date: string; // ISO
  invoiceId: string;
  price: number; // gross price
  discount?: number; // absolute
  customer: { name: string; email: string; initials: string };
  payMode: PayMode;
  payChannel: string;
  status: TxStatus;
};

const txData: Transaction[] = [
  {
    id: "1",
    date: "2025-03-02T16:30:00Z",
    invoiceId: "#ODR115352",
    price: 65,
    discount: 0,
    customer: { name: "Bella Leach", email: "bella@testgmail.com", initials: "BL" },
    payMode: "Gift Card",
    payChannel: "In-App",
    status: "Failed",
  },
  {
    id: "2",
    date: "2025-02-08T18:33:00Z",
    invoiceId: "#ODR115753",
    price: 65,
    discount: 8,
    customer: { name: "Alexandra Guzman", email: "alexandra@testgmail.com", initials: "AG" },
    payMode: "Coupon",
    payChannel: "In-App",
    status: "Success",
  },
  {
    id: "3",
    date: "2025-03-12T05:13:00Z",
    invoiceId: "#ODR115463",
    price: 75,
    discount: 12,
    customer: { name: "Grace Washington", email: "grace@testgmail.com", initials: "GW" },
    payMode: "COD",
    payChannel: "Cash on Delivery",
    status: "Success",
  },
  {
    id: "4",
    date: "2025-03-04T04:30:00Z",
    invoiceId: "#ODR115324",
    price: 65,
    discount: 0,
    customer: { name: "Audrey Hardin", email: "audrey@testgmail.com", initials: "AH" },
    payMode: "UPI",
    payChannel: "Prepaid",
    status: "Success",
  },
  {
    id: "5",
    date: "2025-03-06T04:30:00Z",
    invoiceId: "#ODR115743",
    price: 65,
    discount: 0,
    customer: { name: "Caroline Murphy", email: "caroline@testgmail.com", initials: "CM" },
    payMode: "Debit Card",
    payChannel: "Prepaid",
    status: "Success",
  },
  {
    id: "6",
    date: "2025-03-15T04:30:00Z",
    invoiceId: "#ODR1151231",
    price: 65,
    discount: 10,
    customer: { name: "Jan Franklin", email: "jan1579@testgmail.com", initials: "JF" },
    payMode: "Cash",
    payChannel: "Offline - Store",
    status: "Failed",
  },
  {
    id: "7",
    date: "2025-03-22T04:30:00Z",
    invoiceId: "#ODR115990",
    price: 65,
    discount: 0,
    customer: { name: "David Long", email: "david@testgmail.com", initials: "DL" },
    payMode: "UPI",
    payChannel: "Prepaid",
    status: "Success",
  },
];

const barSeries = [
  { name: "Jan", value: 8 },
  { name: "Feb", value: 6 },
  { name: "Mar", value: 2 },
  { name: "Apr", value: 4 },
  { name: "May", value: 7 },
  { name: "Jun", value: 9 },
  { name: "Jul", value: 5 },
  { name: "Aug", value: 10 },
];

const lineSeries = [
  { name: "Jan", income: 1200, expense: 250 },
  { name: "Feb", income: 1100, expense: 300 },
  { name: "Mar", income: 1400, expense: 280 },
  { name: "Apr", income: 900, expense: 260 },
  { name: "May", income: 1000, expense: 290 },
  { name: "Jun", income: 1300, expense: 310 },
  { name: "Jul", income: 1500, expense: 320 },
  { name: "Aug", income: 1600, expense: 330 },
];

function currency(v: number) {
  return v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function StatusBadge({ s }: { s: TxStatus }) {
  return (
    <Badge
      className={clsx(
        "px-2 py-1 rounded-full text-xs",
        s === "Success"
          ? "bg-violet-600/10 text-violet-700 dark:text-violet-300"
          : "bg-rose-600/10 text-rose-700 dark:text-rose-300"
      )}
      variant="secondary"
    >
      {s}
    </Badge>
  );
}

export default function ManageTransactionPage() {
  const [q, setQ] = useState("");
  const [payFilter, setPayFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return txData.filter((t) => {
      const matchQ =
        q.length === 0 ||
        t.invoiceId.toLowerCase().includes(q.toLowerCase()) ||
        t.customer.name.toLowerCase().includes(q.toLowerCase()) ||
        t.customer.email.toLowerCase().includes(q.toLowerCase());
      const matchPay = payFilter === "all" || t.payMode === payFilter;
      return matchQ && matchPay;
    });
  }, [q, payFilter]);

  const totals = useMemo(() => {
    const income = filtered
      .filter((t) => t.status === "Success")
      .reduce((s, t) => s + (t.price - (t.discount || 0)), 0);
    const expense = 3134.5; // mock
    const returnCost = 134;
    const shippingCost = 3000;
    return { income, expense, returnCost, shippingCost };
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <KpiCard title="Ready" value="85% Ready" delta="+2.75%" />
        <KpiCard title="Revenue" value={currency(12501)} delta="+2.75%" />
        <KpiCard title="Expense" value={currency(3134)} delta="+1.50%" />
        <KpiCard title="Return Cost" value={currency(134)} delta="-1.50%" />
        <KpiCard title="Shipping Cost" value={currency(3000)} delta="-2.65%" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Summary bar */}
        <Card className="lg:col-span-1 border-violet-200">
          <CardHeader>
            <CardTitle className="text-violet-700 dark:text-violet-300">Summary</CardTitle>
            <p className="text-xs text-muted-foreground">Open order amount</p>
            <div className="text-2xl font-semibold mt-1">{currency(2501)}</div>
            <p className="text-xs text-muted-foreground">
              $1500.50 received • 65% prepaid orders
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barSeries}>
                  <CartesianGrid vertical={false} strokeOpacity={0.1} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue generated line */}
        <Card className="lg:col-span-2 border-violet-200">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-violet-700 dark:text-violet-300">
              Revenue Generated
            </CardTitle>
            <div className="flex items-baseline gap-6">
              <div>
                <div className="text-xs text-muted-foreground">Income</div>
                <div className="text-xl font-semibold">{currency(totals.income)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Expense</div>
                <div className="text-xl font-semibold">{currency(totals.expense)}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineSeries}>
                  <CartesianGrid strokeOpacity={0.1} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="income" strokeWidth={2} />
                  <Line type="monotone" dataKey="expense" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="border-violet-200">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-violet-700 dark:text-violet-300">Transactions</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" className="border-violet-300 text-violet-700">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="flex-1">
              <Input
                placeholder="Search invoice, name, email..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="focus-visible:ring-violet-500"
              />
            </div>
            <Select value={payFilter} onValueChange={setPayFilter}>
              <SelectTrigger className="w-52 focus:ring-violet-500">
                <SelectValue placeholder="All payments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All payments</SelectItem>
                {["Gift Card", "Coupon", "COD", "UPI", "Debit Card", "Cash"].map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead className="text-right">Price/Discount</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Pay mode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => {
                  const d = new Date(t.date);
                  return (
                    <TableRow key={t.id}>
                      <TableCell>
                        <div className="font-medium">
                          {d.toLocaleDateString(undefined, {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-violet-500" />
                          <span className="font-medium">{t.invoiceId}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>{currency(t.price)}</div>
                        {t.discount ? (
                          <div className="text-xs text-muted-foreground">
                            - {currency(t.discount)}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-violet-600/10 flex items-center justify-center">
                            <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">
                              {t.customer.initials}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{t.customer.name}</div>
                            <div className="text-xs text-muted-foreground">{t.customer.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{t.payMode}</div>
                        <div className="text-xs text-muted-foreground">{t.payChannel}</div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge s={t.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="icon" className="text-violet-600">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-violet-600">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-rose-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="p-3">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ title, value, delta }: { title: string; value: string; delta: string }) {
  return (
    <Card className="border-violet-200">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-semibold text-violet-700 dark:text-violet-300">{value}</div>
        <div className={clsx("text-xs", delta.startsWith("-") ? "text-rose-600" : "text-emerald-600")}>
          {delta}
        </div>
      </CardContent>
    </Card>
  );
}
