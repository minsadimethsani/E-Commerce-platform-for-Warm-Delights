"use client";

import { useState, useEffect } from "react";
import { AddOn } from "@/lib/addons";
import { doc, setDoc, deleteDoc, collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

interface AddOnsClientProps {
  initialAddOns: AddOn[];
}

export default function AddOnsClient({ initialAddOns }: AddOnsClientProps) {
  const { setIsMutating } = useAuth();
  const [addons, setAddons] = useState<AddOn[]>(initialAddOns);
  const [editingAddOn, setEditingAddOn] = useState<AddOn | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [fee, setFee] = useState("");
  const [desc, setDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Realtime updates
  useEffect(() => {
    const addonsRef = collection(db, "addons");
    const q = query(addonsRef);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: AddOn[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            name: data.name,
            fee: data.fee,
            desc: data.desc || "",
          } as AddOn);
        });
        // Sort alphabetically
        list.sort((a, b) => a.name.localeCompare(b.name));
        setAddons(list);
      },
      (error) => {
        console.error("Firestore onSnapshot for addons failed:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleEditClick = (addon: AddOn) => {
    setEditingAddOn(addon);
    setName(addon.name);
    setFee(addon.fee.toString());
    setDesc(addon.desc);
  };

  const handleCancelEdit = () => {
    setEditingAddOn(null);
    setName("");
    setFee("");
    setDesc("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !fee.trim()) return;

    setIsSubmitting(true);
    setIsMutating(true);

    try {
      const priceVal = parseFloat(fee);
      if (isNaN(priceVal)) {
        alert("Please enter a valid price/fee.");
        setIsSubmitting(false);
        setIsMutating(false);
        return;
      }

      const cleanName = name.trim();
      const cleanDesc = desc.trim();

      if (editingAddOn) {
        // Edit existing addon
        const docRef = doc(db, "addons", editingAddOn.id);
        const updatedAddOn: AddOn = {
          id: editingAddOn.id,
          name: cleanName,
          fee: priceVal,
          desc: cleanDesc,
        };
        await setDoc(docRef, updatedAddOn);
        setEditingAddOn(null);
      } else {
        // Add new addon
        const newId = slugify(cleanName);
        if (addons.some((a) => a.id === newId)) {
          alert("An add-on option with this name or identifier already exists.");
          setIsSubmitting(false);
          setIsMutating(false);
          return;
        }

        const docRef = doc(db, "addons", newId);
        const newAddOn: AddOn = {
          id: newId,
          name: cleanName,
          fee: priceVal,
          desc: cleanDesc,
        };
        await setDoc(docRef, newAddOn);
      }

      // Reset Form
      setName("");
      setFee("");
      setDesc("");
    } catch (error) {
      console.error("Error saving add-on:", error);
      alert("Failed to save the optional add-on option.");
    } finally {
      setIsSubmitting(false);
      setIsMutating(false);
    }
  };

  const handleDeleteClick = async (addon: AddOn) => {
    if (!confirm(`Are you sure you want to delete the optional add-on "${addon.name}"?`)) {
      return;
    }

    setIsMutating(true);
    try {
      const docRef = doc(db, "addons", addon.id);
      await deleteDoc(docRef);
      if (editingAddOn?.id === addon.id) {
        handleCancelEdit();
      }
    } catch (error) {
      console.error("Error deleting add-on:", error);
      alert("Failed to delete the optional add-on option.");
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* List Column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-[#2A1E17]/10 p-6 rounded-none shadow-xs">
          <h2 className="font-serif text-xl font-bold text-[#2A1E17] border-b border-[#2A1E17]/5 pb-4 mb-4">
            Active Optional Add-Ons
          </h2>

          {addons.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#3A2E2B]/55">
              No optional add-ons configured. Add new options using the form on the right.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#2A1E17]/10 text-[10px] font-bold uppercase tracking-wider text-[#3A2E2B]/60">
                    <th className="pb-3 pr-4">Name / ID</th>
                    <th className="pb-3 px-4">Description</th>
                    <th className="pb-3 px-4 text-right">Fee (Rs.)</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A1E17]/5">
                  {addons.map((addon) => (
                    <tr key={addon.id} className="hover:bg-[#EFEFEA]/30 transition-colors">
                      <td className="py-3.5 pr-4 font-bold text-[#2A1E17]">
                        <div>{addon.name}</div>
                        <div className="font-mono text-[9px] text-[#3A2E2B]/50 font-normal mt-0.5">ID: {addon.id}</div>
                      </td>
                      <td className="py-3.5 px-4 text-[#3A2E2B]/80 max-w-[200px] truncate" title={addon.desc}>
                        {addon.desc || <span className="text-[#3A2E2B]/40 italic">No description</span>}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#2A1E17] font-mono">
                        Rs. {addon.fee.toFixed(2)}
                      </td>
                      <td className="py-3.5 pl-4 text-right space-x-2.5">
                        <button
                          type="button"
                          onClick={() => handleEditClick(addon)}
                          className="text-[#C5A880] hover:text-[#2A1E17] font-bold transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(addon)}
                          className="text-rose-650 hover:text-rose-800 font-bold transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Form Column */}
      <div className="space-y-6">
        <div className="bg-white border border-[#2A1E17]/10 p-6 rounded-none shadow-xs">
          <h2 className="font-serif text-xl font-bold text-[#2A1E17] border-b border-[#2A1E17]/5 pb-4 mb-4">
            {editingAddOn ? "Edit Option Details" : "Create New Option"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="addon-name" className="block text-[10px] font-bold uppercase tracking-wider text-[#3A2E2B]/75">
                Add-On Name *
              </label>
              <input
                id="addon-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Gift Box"
                className="w-full bg-[#EFEFEA] border border-[#2A1E17]/10 rounded-none p-2.5 text-xs text-[#2A1E17] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="addon-fee" className="block text-[10px] font-bold uppercase tracking-wider text-[#3A2E2B]/75">
                Additional Fee (Rs.) *
              </label>
              <input
                id="addon-fee"
                type="number"
                step="0.01"
                required
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="e.g. 8.00"
                className="w-full bg-[#EFEFEA] border border-[#2A1E17]/10 rounded-none p-2.5 text-xs text-[#2A1E17] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="addon-desc" className="block text-[10px] font-bold uppercase tracking-wider text-[#3A2E2B]/75">
                Description / Label
              </label>
              <textarea
                id="addon-desc"
                rows={3}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Brief description showing on storefront checkout options..."
                className="w-full bg-[#EFEFEA] border border-[#2A1E17]/10 rounded-none p-2.5 text-xs text-[#2A1E17] focus:outline-none focus:border-[#C5A880] resize-none"
              />
            </div>

            <div className="pt-2 flex gap-3">
              {editingAddOn && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 bg-[#EFEFEA] hover:bg-[#2A1E17]/5 text-[#2A1E17] font-bold py-2.5 text-xs uppercase tracking-wider transition-colors cursor-pointer rounded-none border border-[#2A1E17]/10"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#2A1E17] hover:bg-[#C5A880] hover:text-[#2A1E17] text-white font-bold py-2.5 text-xs uppercase tracking-wider transition-all cursor-pointer rounded-none disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : editingAddOn ? "Save Changes" : "Create Option"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
