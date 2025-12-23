import React, { useState } from 'react';
import { FoodItem } from '../types';
import FoodCreationForm from './FoodDatabase/FoodCreationForm';
import FoodTable from './FoodDatabase/FoodTable';

interface FoodDatabaseProps {
  foods: FoodItem[];
  onAddFood: (food: FoodItem) => void;
  onDeleteFood: (id: string) => void;
}

const FoodDatabase: React.FC<FoodDatabaseProps> = ({ foods, onAddFood, onDeleteFood }) => {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">食物資料庫</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> 新增食材
        </button>
      </div>

      {isAdding && (
        <FoodCreationForm
          onAddFood={onAddFood}
          onClose={() => setIsAdding(false)}
        />
      )}

      <FoodTable
        foods={foods}
        onDeleteFood={onDeleteFood}
      />
    </div>
  );
};

export default FoodDatabase;
