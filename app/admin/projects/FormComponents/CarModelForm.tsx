"use client";

import { useState } from "react";
import { CarModelItem } from "../types";
import FormActions from "./FormActions";
import { inputClass, labelClass } from "./constants";

interface CarModelFields {
  car_brand: string;
}

const getCarModelState = (item?: CarModelItem | null): CarModelFields => ({
  car_brand: item?.car_brand || "",
});

const CarModelForm = ({
  item,
  onSave,
  onClose,
}: {
  item?: CarModelItem | null;
  onSave: (data: CarModelFields) => Promise<void>;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState<CarModelFields>(() =>
    getCarModelState(item)
  );
  const [saving, setSaving] = useState(false);

  const isUnchanged = item ? formData.car_brand === item.car_brand : false;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ car_brand: formData.car_brand.trim() });
        setSaving(false);
      }}
    >
      <div>
        <label className={labelClass}>
          Nume Brand <span className="text-red-500">*</span>
        </label>
        <input
          name="car_brand"
          value={formData.car_brand}
          onChange={(e) => setFormData({ car_brand: e.target.value })}
          type="text"
          placeholder="ex: BMW, Audi, Mercedes"
          required
          className={inputClass}
        />
      </div>

      <FormActions
        saving={saving}
        disabled={saving || isUnchanged || !formData.car_brand.trim()}
        onClose={onClose}
      />
    </form>
  );
};

export default CarModelForm;
