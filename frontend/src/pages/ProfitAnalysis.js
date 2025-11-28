import React, { useState, useEffect } from 'react';
import { getProfitAnalysisByProduct, getProfitSummary } from '../services/api';

function ProfitAnalysis() {
  const [profitData, setProfitData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfitData();
  }, []);

  const loadProfitData = async () => {
    try {
      setLoading(true);
      const [analysisRes, summaryRes] = await Promise.all([
        getProfitAnalysisByProduct(),
        getProfitSummary()
      ]);
      setProfitData(analysisRes.data.data);
      setSummary(summaryRes.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load profit analysis');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading profit analysis...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!summary) return null;

  const totalPurchaseCost = Number(summary.total_purchase_cost) || 0;
  const totalRevenue = Number(summary.total_revenue) || 0;
  const grossProfit = Number(summary.gross_profit) || 0;
  const profitMargin = Number(summary.profit_margin_percentage) || 0;
  const totalCogs = Number(summary.total_cogs) || 0;

  return (
    <div>
      <div className="page-header">
        <h2>💰 Profit Analysis</h2>
        <p style={{ color: '#7f8c8d', marginTop: '0.5rem' }}>
          Track your purchase costs, revenue, and profit margins
        </p>
      </div>

      {/* Overall Summary */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white' }}>
        <h3 style={{ color: 'white' }}>📊 Overall Financial Summary</h3>
        <div className="metrics-grid" style={{ marginTop: '1.5rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Purchase Cost</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
              {totalPurchaseCost.toLocaleString()} KSH
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.3rem' }}>
              All stock purchased
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.5rem' }}>Cost of Goods Sold</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
              {totalCogs.toLocaleString()} KSH
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.3rem' }}>
              Cost of distributed stock
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Revenue</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
              {totalRevenue.toLocaleString()} KSH
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.3rem' }}>
              All distributions
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.15)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.5rem' }}>Gross Profit</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: grossProfit >= 0 ? '#FFEB3B' : '#FF6B6B' }}>
              {grossProfit.toLocaleString()} KSH
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.3rem' }}>
              Profit Margin: <strong>{profitMargin.toFixed(1)}%</strong>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Units Purchased</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '0.3rem' }}>
                {Number(summary.total_purchased_units) || 0}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Units Distributed</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '0.3rem' }}>
                {Number(summary.total_distributed_units) || 0}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Remaining Stock</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '0.3rem' }}>
                {(Number(summary.total_purchased_units) || 0) - (Number(summary.total_distributed_units) || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profit by Product */}
      <div className="card">
        <h3>📦 Profit Analysis by Product</h3>
        <p className="card-subtitle">See margin and profit for each product</p>

        {profitData.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
            No profit data available yet
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Avg Purchase Price</th>
                  <th>Avg Selling Price</th>
                  <th>Margin per Unit</th>
                  <th>Units Sold</th>
                  <th>Total Revenue</th>
                  <th>Total Profit</th>
                  <th>Profit %</th>
                </tr>
              </thead>
              <tbody>
                {profitData.map((product) => {
                  const avgPurchase = Number(product.avg_purchase_price) || 0;
                  const avgSelling = Number(product.avg_selling_price) || 0;
                  const marginPerUnit = Number(product.margin_per_unit) || 0;
                  const totalProfit = Number(product.total_profit) || 0;
                  const profitPercent = Number(product.profit_percentage) || 0;
                  const unitsSold = Number(product.total_distributed_units) || 0;
                  const revenue = Number(product.total_revenue) || 0;
                  const unitType = product.unit_type === 'piece' ? 'Piece' : 'Crate';

                  return (
                    <tr key={product.product_id}>
                      <td><strong>{product.product_name}</strong></td>
                      <td>{unitType}</td>
                      <td>{avgPurchase.toLocaleString()} KSH</td>
                      <td>{avgSelling.toLocaleString()} KSH</td>
                      <td style={{ 
                        color: marginPerUnit >= 0 ? '#27ae60' : '#e74c3c',
                        fontWeight: 'bold'
                      }}>
                        {marginPerUnit >= 0 ? '+' : ''}{marginPerUnit.toLocaleString()} KSH
                      </td>
                      <td>{unitsSold}</td>
                      <td>{revenue.toLocaleString()} KSH</td>
                      <td style={{ 
                        color: totalProfit >= 0 ? '#27ae60' : '#e74c3c',
                        fontWeight: 'bold'
                      }}>
                        {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString()} KSH
                      </td>
                      <td>
                        <span style={{
                          padding: '0.3rem 0.6rem',
                          borderRadius: '4px',
                          background: profitPercent >= 50 ? '#27ae60' : profitPercent >= 25 ? '#f39c12' : '#e74c3c',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.85rem'
                        }}>
                          {profitPercent.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f8f9fa', fontWeight: 'bold' }}>
                  <td colSpan="6" style={{ textAlign: 'right', paddingRight: '1rem' }}>TOTALS:</td>
                  <td>{totalRevenue.toLocaleString()} KSH</td>
                  <td style={{ color: grossProfit >= 0 ? '#27ae60' : '#e74c3c' }}>
                    {grossProfit >= 0 ? '+' : ''}{grossProfit.toLocaleString()} KSH
                  </td>
                  <td>
                    <span style={{
                      padding: '0.3rem 0.6rem',
                      borderRadius: '4px',
                      background: profitMargin >= 50 ? '#27ae60' : profitMargin >= 25 ? '#f39c12' : '#e74c3c',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.85rem'
                    }}>
                      {profitMargin.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="card">
        <h3>💡 Insights</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {/* Best Performing Product */}
          {profitData.length > 0 && (
            <div style={{ padding: '1rem', background: '#e8f5e9', borderRadius: '8px', border: '2px solid #4caf50' }}>
              <div style={{ fontSize: '0.9rem', color: '#2e7d32', marginBottom: '0.5rem' }}>🏆 Best Performer</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1b5e20' }}>
                {profitData[0].product_name}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#2e7d32', marginTop: '0.3rem' }}>
                Profit: {Number(profitData[0].total_profit).toLocaleString()} KSH
              </div>
            </div>
          )}

          {/* Highest Margin Product */}
          {profitData.length > 0 && (() => {
            const highestMarginProduct = [...profitData].sort((a, b) => 
              (Number(b.profit_percentage) || 0) - (Number(a.profit_percentage) || 0)
            )[0];
            return (
              <div style={{ padding: '1rem', background: '#fff3e0', borderRadius: '8px', border: '2px solid #ff9800' }}>
                <div style={{ fontSize: '0.9rem', color: '#e65100', marginBottom: '0.5rem' }}>📈 Highest Margin</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#bf360c' }}>
                  {highestMarginProduct.product_name}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#e65100', marginTop: '0.3rem' }}>
                  Margin: {Number(highestMarginProduct.profit_percentage).toFixed(1)}%
                </div>
              </div>
            );
          })()}

          {/* Total Products Tracked */}
          <div style={{ padding: '1rem', background: '#e3f2fd', borderRadius: '8px', border: '2px solid #2196f3' }}>
            <div style={{ fontSize: '0.9rem', color: '#0d47a1', marginBottom: '0.5rem' }}>📊 Products Tracked</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#01579b' }}>
              {profitData.length} Products
            </div>
            <div style={{ fontSize: '0.85rem', color: '#0d47a1', marginTop: '0.3rem' }}>
              With purchase & sales data
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="card" style={{ background: '#f5f5f5', border: '1px solid #e0e0e0' }}>
        <h3>ℹ️ How to Read This Report</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <strong style={{ color: '#2c3e50' }}>Purchase Cost:</strong>
            <p style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.3rem' }}>
              Total money spent buying stock from suppliers
            </p>
          </div>
          <div>
            <strong style={{ color: '#2c3e50' }}>Revenue:</strong>
            <p style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.3rem' }}>
              Total money received from distributions to messes
            </p>
          </div>
          <div>
            <strong style={{ color: '#2c3e50' }}>Gross Profit:</strong>
            <p style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.3rem' }}>
              Revenue minus cost of goods sold (COGS)
            </p>
          </div>
          <div>
            <strong style={{ color: '#2c3e50' }}>Profit Margin:</strong>
            <p style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.3rem' }}>
              Percentage showing profit relative to costs (Higher is better)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfitAnalysis;
