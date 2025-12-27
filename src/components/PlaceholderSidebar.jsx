
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDocuments } from '@/contexts/DocumentContext';
import { Button } from '@/components/ui/button';
import { Code2, Search } from 'lucide-react';

function PlaceholderSidebar({ onInsert }) {
  const { placeholders } = useDocuments();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(placeholders.map(p => p.category))];
  
  const filteredPlaceholders = placeholders.filter(p => {
    const matchesSearch = p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDragStart = (e, code) => {
    e.dataTransfer.setData('text/plain', code);
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 h-full flex flex-col overflow-hidden">
      <div className="bg-white/5 px-4 py-3 border-b border-white/20">
        <h3 className="text-white font-semibold flex items-center">
          <Code2 className="w-5 h-5 mr-2" />
          Placeholders
        </h3>
      </div>

      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search placeholders..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {filteredPlaceholders.map((placeholder) => (
          <motion.div
            key={placeholder.id}
            draggable
            onDragStart={(e) => handleDragStart(e, placeholder.code)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white/5 rounded-lg p-3 border border-white/10 cursor-move hover:bg-white/10 transition-all group"
          >
            <div className="flex items-start justify-between mb-2">
              <code className="text-sm font-mono text-blue-300 font-semibold">{placeholder.code}</code>
              <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                {placeholder.category}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-2">Type: {placeholder.templateType}</p>
            <p className="text-xs text-white bg-white/5 px-2 py-1 rounded">
              Demo: {placeholder.demoValue}
            </p>
            <Button
              onClick={() => onInsert(placeholder.code)}
              size="sm"
              className="w-full mt-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Insert
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="bg-white/5 px-4 py-3 border-t border-white/20">
        <p className="text-xs text-gray-400 text-center">
          Drag & drop or click to insert
        </p>
      </div>
    </div>
  );
}

export default PlaceholderSidebar;
