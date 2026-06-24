import assert from 'node:assert/strict';

const money = (value) => Number((value || 0).toFixed(2));
const formatCurrency = (value) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
}).format(Number(value || 0));

const sumLineItems = (lineItems = [], { includeOptional = false } = {}) => money(
  lineItems.reduce((total, item) => {
    if (item.optional && !includeOptional && !item.selected) return total;
    return total + Number(item.quantity || 0) * Number(item.unitPrice || 0);
  }, 0),
);

const recalcInvoice = (invoice) => {
  const subtotal = sumLineItems(invoice.lineItems || []);
  const tax = money(Number(invoice.tax || 0));
  const total = money(subtotal + tax);
  const amountPaid = money(Number(invoice.amountPaid || 0));
  return { ...invoice, subtotal, tax, total, amountPaid, balanceDue: money(Math.max(0, total - amountPaid)) };
};

const canEditQuote = (quote) => Boolean(quote) && quote.status !== 'accepted' && quote.status !== 'declined' && !quote.locked;
const canEditContract = (contract) => Boolean(contract) && contract.status === 'draft' && !contract.locked;
const canEditInvoice = (invoice) => Boolean(invoice) && invoice.status !== 'paid' && !invoice.locked;
const safeJsonParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const detectNotificationSupport = (env = {}) => Boolean(env.hasWindow && env.hasNotification && env.hasServiceWorker);

assert.equal(formatCurrency(1234.56), '$1,235');
assert.equal(sumLineItems([{ quantity: 2, unitPrice: 125 }, { quantity: 1, unitPrice: 50, optional: true }]), 250);
assert.equal(sumLineItems([{ quantity: 2, unitPrice: 125 }, { quantity: 1, unitPrice: 50, optional: true, selected: true }]), 300);
assert.deepEqual(recalcInvoice({ lineItems: [{ quantity: 1, unitPrice: 500 }], tax: 0, amountPaid: 200 }), {
  lineItems: [{ quantity: 1, unitPrice: 500 }], tax: 0, amountPaid: 200, subtotal: 500, total: 500, balanceDue: 300,
});
assert.equal(canEditQuote({ status: 'draft', locked: false }), true);
assert.equal(canEditQuote({ status: 'sent', locked: true }), false);
assert.equal(canEditQuote({ status: 'accepted', locked: false }), false);
assert.equal(canEditContract({ status: 'draft', locked: false }), true);
assert.equal(canEditContract({ status: 'signed', locked: true }), false);
assert.equal(canEditInvoice({ status: 'sent', locked: true }), false);
assert.equal(canEditInvoice({ status: 'paid', locked: true }), false);
assert.deepEqual(safeJsonParse('{ bad json', []), []);
assert.deepEqual(safeJsonParse('[1,2]', []), [1, 2]);
assert.equal(detectNotificationSupport({ hasWindow: true, hasNotification: true, hasServiceWorker: true }), true);
assert.equal(detectNotificationSupport({ hasWindow: true, hasNotification: true, hasServiceWorker: false }), false);

console.log('Diagnostics passed: money, locks, invoice math, safe JSON, notification support.');
