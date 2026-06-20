"use client";

import { useState } from "react";
import { RemapItem } from "../types";
import FormActions from "./FormActions";
import { inputClass, labelClass } from "./constants";

const getRemapState = (item?: RemapItem | null): RemapFields => ({
  solution_name: item?.solution_name || "",
});

interface RemapFields {
  solution_name: string;
}

const RemapForm = ({
  item,
  onSave,
  onClose,
}: {
  item?: RemapItem | null;
  onSave: (data: RemapFields) => Promise<void>;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState<RemapFields>(() =>
    getRemapState(item)
  );
  const [saving, setSaving] = useState(false);

  const isUnchanged = item
    ? formData.solution_name === item.solution_name
    : false;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ solution_name: formData.solution_name.trim() });
        setSaving(false);
      }}
    >
      <div>
        <label className={labelClass}>
          Nume solutie <span className="text-red-500">*</span>
        </label>
        <input
          name="solution_name"
          value={formData.solution_name}
          onChange={(e) => setFormData({ solution_name: e.target.value })}
          type="text"
          placeholder="ex: Stage 1, Stage 2, Eco"
          required
          className={inputClass}
        />
      </div>

      <FormActions
        saving={saving}
        disabled={saving || isUnchanged || !formData.solution_name.trim()}
        onClose={onClose}
      />
    </form>
  );
};

export default RemapForm;
