"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Trash2, Download } from "lucide-react";

export default function AdminNewsletterPage() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchSubscribers = async () => {
    const res = await apiClient.get("/newsletter/subscribers", { params: { page, limit: 50 } });
    setData(res.data.data);
    setTotal(res.data.total);
    setTotalPages(res.data.totalPages);
  };

  useEffect(() => { fetchSubscribers(); }, [page]);

  const deleteSubscriber = async (id: string) => {
    await apiClient.delete(`/newsletter/${id}`);
    setDeleteConfirm(null);
    fetchSubscribers();
  };

  const exportCSV = () => {
    const csv = ["Email,Status,Subscribed Date",
      ...data.map(s => `${s.email},${s.status},${new Date(s.createdAt).toLocaleDateString()}`)
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Newsletter Subscribers</h1>
          <p className="text-muted-foreground">{total} total subscribers</p>
        </div>
        <Button variant="outline" onClick={exportCSV} disabled={data.length === 0}>
          <Download size={15} className="mr-2" /> Export CSV
        </Button>
      </div>

      {/* Subscriber stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-4">
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-sm text-muted-foreground">Total Subscribers</p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-2xl font-bold text-green-400">{data.filter(d => d.status === "ACTIVE").length}</p>
          <p className="text-sm text-muted-foreground">Active</p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-2xl font-bold text-muted-foreground">{data.filter(d => d.status === "UNSUBSCRIBED").length}</p>
          <p className="text-sm text-muted-foreground">Unsubscribed</p>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Subscribed</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-16 text-center text-muted-foreground">No subscribers yet</td></tr>
            ) : (
              data.map(sub => (
                <tr key={sub.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">{sub.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sub.status === "ACTIVE" ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteConfirm(sub.id)}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-background border rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-semibold text-lg mb-2">Remove Subscriber</h3>
            <p className="text-muted-foreground text-sm mb-4">This will permanently delete this subscription record.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteSubscriber(deleteConfirm)}>Remove</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
