"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Modal } from "@/components/ui/Modal";
import {
  Layers,
  Building2,
  MapPin,
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Home,
  Check,
  DoorOpen,
} from "lucide-react";
import api from "@/lib/api";
import { useConfirm } from "@/components/providers/ConfirmProvider";

export default function SocietyMasterPage() {
  const { confirmDelete } = useConfirm();
  const [society, setSociety] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  // Add Block Modal
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [blockError, setBlockError] = useState<string | null>(null);
  const [blockForm, setBlockForm] = useState({
    name: "",
    blockCode: "",
    totalFloors: 5,
    description: "",
  });

  // Edit Block Modal
  const [editingBlock, setEditingBlock] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    blockCode: "",
    totalFloors: 5,
    status: "ACTIVE",
  });

  const fetchSociety = async () => {
    try {
      setLoading(true);
      const [socRes, blocksRes] = await Promise.all([
        api.get("/society").catch(() => null),
        api.get("/society/blocks").catch(() => null),
      ]);
      const socData = socRes?.data?.data || null;
      const blkList = blocksRes?.data?.data || socData?.blocks || [];
      setSociety(socData);
      setBlocks(blkList);
    } catch (err) {
      console.error("Failed to load society master", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSociety();
  }, []);

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlockError(null);
    setBlockLoading(true);

    try {
      const res = await api.post("/society/blocks", {
        name: blockForm.name.trim(),
        code: blockForm.blockCode.trim().toUpperCase(),
        blockCode: blockForm.blockCode.trim().toUpperCase(),
        numberOfFloors: Number(blockForm.totalFloors),
        totalFloors: Number(blockForm.totalFloors),
        description: blockForm.description.trim() ? blockForm.description.trim() : undefined,
      });

      if (res.data.success) {
        setIsAddBlockOpen(false);
        setBlockForm({ name: "", blockCode: "", totalFloors: 5, description: "" });
        await fetchSociety();
      }
    } catch (err: any) {
      setBlockError(err.response?.data?.message || "Failed to create block");
    } finally {
      setBlockLoading(false);
    }
  };

  const handleOpenEdit = (block: any) => {
    setEditingBlock(block);
    setEditForm({
      name: block.name || "",
      blockCode: block.code || block.blockCode || "",
      totalFloors: block.numberOfFloors || block.totalFloors || 5,
      status: block.status || "ACTIVE",
    });
    setEditError(null);
  };

  const handleUpdateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlock) return;
    setEditError(null);
    setEditLoading(true);

    try {
      const res = await api.put(`/society/blocks/${editingBlock.id}`, {
        name: editForm.name.trim(),
        code: editForm.blockCode.trim().toUpperCase(),
        blockCode: editForm.blockCode.trim().toUpperCase(),
        numberOfFloors: Number(editForm.totalFloors),
        totalFloors: Number(editForm.totalFloors),
        status: editForm.status,
      });

      if (res.data.success) {
        setEditingBlock(null);
        await fetchSociety();
      }
    } catch (err: any) {
      setEditError(err.response?.data?.message || "Failed to update tower");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteBlock = async (block: any) => {
    const confirmed = await confirmDelete({
      title: "Deactivate Tower",
      itemName: block.name,
      itemType: "Tower / Block",
      message: `Are you sure you want to deactivate ${block.name}? If flats exist in this tower, you cannot delete it.`,
      confirmText: "Deactivate Tower",
      dangerNote: "Tower will be marked as inactive and cannot be removed if active flats or rooms exist within it.",
    });
    if (!confirmed) {
      return;
    }
    setActionError(null);
    try {
      const res = await api.delete(`/society/blocks/${block.id}`);
      if (res.data.success) {
        await fetchSociety();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to delete tower");
    }
  };

  const filteredBlocks = blocks.filter((b: any) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    const nameMatch = (b.name || "").toLowerCase().includes(term);
    const codeMatch = (b.code || b.blockCode || "").toLowerCase().includes(term);
    return nameMatch || codeMatch;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Single Unified Header */}
        {loading ? (
          <div className="h-24 bg-white border border-slate-200/80 rounded-2xl animate-pulse"></div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">
                      {society?.name || "Green Garden Residential Society"}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      Active Society
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{society?.address || "Sector 4, Gomti Nagar Extension, Lucknow, UP"}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {society?.registrationNumber && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-right hidden sm:block">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                      Registration No
                    </span>
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      {society.registrationNumber}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setIsAddBlockOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Tower / Block</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Action Error Alert */}
        {actionError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-rose-500 hover:text-rose-800 font-bold ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Towers & Blocks Table Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Towers & Blocks Directory
                </h3>
                <p className="text-xs text-slate-400">
                  {blocks.length} {blocks.length === 1 ? "Tower" : "Towers"} configured in the society
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search towers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-5">Tower / Block</th>
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Floors</th>
                  <th className="py-3.5 px-4">Flats Overview</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-5">
                        <div className="h-4 w-32 bg-slate-200 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-12 bg-slate-200 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-16 bg-slate-200 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-24 bg-slate-200 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-16 bg-slate-200 rounded"></div>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="h-4 w-12 bg-slate-200 rounded ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredBlocks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">No towers or blocks found</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {search ? "Try adjusting your search query" : "Click '+ Add Tower / Block' to create your first tower"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredBlocks.map((block: any) => {
                    const blockCode = block.code || block.blockCode || "-";
                    const floorsCount = block.numberOfFloors || block.totalFloors || 5;
                    const isActive = block.status !== "INACTIVE";

                    return (
                      <tr key={block.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 font-mono font-bold flex items-center justify-center text-xs border border-emerald-200/60 shadow-2xs">
                              {blockCode}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block text-xs">
                                {block.name}
                              </span>
                              {block.description && (
                                <span className="text-[11px] text-slate-400 block max-w-xs truncate">
                                  {block.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-mono font-bold rounded-md text-[11px] border border-slate-200">
                            {blockCode}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-slate-700 font-medium text-xs">
                            {floorsCount} Floors
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {block.totalFlats !== undefined ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                                {block.totalFlats} Flats
                              </span>
                              {block.occupiedFlats !== undefined && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200/60">
                                  {block.occupiedFlats} Occ
                                </span>
                              )}
                              {block.vacantFlats !== undefined && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                                  {block.vacantFlats} Vac
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActive ? "bg-emerald-600" : "bg-slate-400"
                              }`}
                            ></span>
                            {block.status || "ACTIVE"}
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(block)}
                              className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition border border-transparent hover:border-emerald-200"
                              title="Edit Tower"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBlock(block)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition border border-transparent hover:border-rose-200"
                              title="Deactivate / Delete Tower"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Block Modal */}
      <Modal
        isOpen={isAddBlockOpen}
        onClose={() => setIsAddBlockOpen(false)}
        title="Add New Tower / Block"
        maxWidth="sm"
      >
        <form onSubmit={handleAddBlock} className="space-y-4">
          {blockError && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {blockError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tower / Block Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Tower D (Emerald Wing)"
              value={blockForm.name}
              onChange={(e) => setBlockForm({ ...blockForm, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Block Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. D"
                value={blockForm.blockCode}
                onChange={(e) => setBlockForm({ ...blockForm, blockCode: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none uppercase font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Floors
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={blockForm.totalFloors}
                onChange={(e) =>
                  setBlockForm({ ...blockForm, totalFloors: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <input
              type="text"
              placeholder="e.g. Residential wing with 2 lifts"
              value={blockForm.description}
              onChange={(e) => setBlockForm({ ...blockForm, description: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddBlockOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={blockLoading}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
            >
              {blockLoading ? "Adding..." : "Add Tower"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Block Modal */}
      <Modal
        isOpen={Boolean(editingBlock)}
        onClose={() => setEditingBlock(null)}
        title={`Edit Tower / Block: ${editingBlock?.name || ""}`}
        maxWidth="sm"
      >
        <form onSubmit={handleUpdateBlock} className="space-y-4">
          {editError && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {editError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tower / Block Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Tower A"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Block Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. T-A"
                value={editForm.blockCode}
                onChange={(e) => setEditForm({ ...editForm, blockCode: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none uppercase font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Floors
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={editForm.totalFloors}
                onChange={(e) =>
                  setEditForm({ ...editForm, totalFloors: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status
            </label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingBlock(null)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editLoading}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
            >
              {editLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
