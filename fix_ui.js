const fs = require('fs');

const files = [
  'frontend/pages/farmer/farmerHub/transactions/index.tsx',
  'frontend/pages/processor/processorHub/transactions/index.tsx',
  'frontend/pages/distributor/distributorHub/transactions/index.tsx',
  'frontend/pages/retailer/retailerHub/transactions/index.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Add ArrowUpRight if missing
  if (!content.includes('ArrowUpRight')) {
    content = content.replace('ArrowDownLeft,', 'ArrowDownLeft,\n  ArrowUpRight,');
  }

  // Inject helper function
  if (!content.includes('getTransactionDisplay')) {
    content = content.replace(
      'const [transactions, setTransactions] = useState<any[]>([]);',
      `const [transactions, setTransactions] = useState<any[]>([]);\n\n  const getTransactionDisplay = (tx: any) => {\n    if (tx.type === "PAYOUT") return { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: <ArrowDownLeft className="h-5 w-5" />, label: "Received from:", sign: "+ ", amountColor: "text-emerald-400", modalBg: "bg-emerald-700" };\n    if (tx.type === "PAYMENT") return { color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", icon: <ArrowUpRight className="h-5 w-5" />, label: "Paid to:", sign: "- ", amountColor: "text-rose-400", modalBg: "bg-rose-600" };\n    if (tx.type === "REFUND") return { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: <ArrowDownLeft className="h-5 w-5" />, label: "Refund for:", sign: "+ ", amountColor: "text-blue-400", modalBg: "bg-blue-600" };\n    return { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: <Lock className="h-5 w-5" />, label: "Escrow Locked:", sign: "", amountColor: "text-amber-300", modalBg: "bg-amber-600" };\n  };`
    );
  }

  // Replace map function body
  const mapRegex = /filteredTransactions\.map\(\(tx\) => \(\s*<div[\s\S]*?(?=\)\)\n\s*\)}\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>)/;
  
  const newMapBody = `filteredTransactions.map((tx) => {
                const display = getTransactionDisplay(tx);
                return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="bg-stone-950/60 border border-stone-800/80 hover:border-stone-700/80 rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-900/50 transition shadow-sm"
                >
                  {/* Left Side: Icon + Title & Buyer */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={\`p-2.5 rounded-xl border shrink-0 \${display.bg} \${display.color}\`}>
                      {display.icon}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm tracking-tight truncate">
                        {tx.cropName || tx.title || 'Transaction'}
                      </h4>
                      <p className="text-xs text-stone-400 truncate mt-0.5">
                        {display.label} <strong className="text-stone-300 font-semibold">{tx.buyer}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Amount & Date */}
                  <div className="text-right shrink-0">
                    <span className={\`text-base font-extrabold block tracking-tight \${display.amountColor}\`}>
                      {display.sign}{tx.amount}
                    </span>
                    <span className="text-xs text-stone-400 font-medium block mt-0.5">
                      {tx.date}
                    </span>
                  </div>
                </div>
              )})`;

  content = content.replace(mapRegex, newMapBody);

  // Replace modal dynamic parts
  content = content.replace(
    /className=\{\`p-4 sm:p-5 text-white flex items-center justify-between \$\{\n\s*selectedTx\.type === 'PAYOUT' \? 'bg-emerald-700' : 'bg-amber-600'\n\s*\}\`\}/g,
    `className={\`p-4 sm:p-5 text-white flex items-center justify-between \${getTransactionDisplay(selectedTx).modalBg}\`}`
  );

  content = content.replace(
    /\{selectedTx\.type === "PAYOUT" \? "Received from" : "Escrow Payment from"\}/g,
    `{getTransactionDisplay(selectedTx).label}`
  );

  fs.writeFileSync(file, content);
  console.log('Fixed UI in ' + file);
}
