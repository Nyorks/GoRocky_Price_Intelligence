import { useState } from 'react';
import CompetitorsConfig from '../components/config/CompetitorsConfig';
import ProductsConfig from '../components/config/ProductsConfig';
import ProductMappingsConfig from '../components/config/ProductMappingsConfig';
import './ConfigPage.css';

type Tab = 'competitors' | 'products' | 'mappings';

function ConfigPage() {
  const [activeTab, setActiveTab] = useState<Tab>('competitors');

  return (
    <div className="config-page">
      <h1>Configuration</h1>
      <p className="subtitle">Manage competitors, products, and price tracking mappings</p>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'competitors' ? 'active' : ''}`}
          onClick={() => setActiveTab('competitors')}
        >
          Competitors
        </button>
        <button
          className={`tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button
          className={`tab ${activeTab === 'mappings' ? 'active' : ''}`}
          onClick={() => setActiveTab('mappings')}
        >
          Product Mappings
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'competitors' && <CompetitorsConfig />}
        {activeTab === 'products' && <ProductsConfig />}
        {activeTab === 'mappings' && <ProductMappingsConfig />}
      </div>
    </div>
  );
}

export default ConfigPage;

