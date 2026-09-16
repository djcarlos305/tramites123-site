const money=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
const val=id=>Number(document.getElementById(id)?.value)||0;
const pay=(principal,annualRate,months)=>{const r=annualRate/100/12;return r===0?principal/months:principal*(r*Math.pow(1+r,months))/(Math.pow(1+r,months)-1)};
const put=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=money.format(Number.isFinite(value)?Math.max(0,value):0)};
function mortgage(){const price=val('homePrice'),down=val('downPayment'),months=val('loanTerm')*12,principal=Math.max(0,price-down),pi=pay(principal,val('interestRate'),months),tax=val('propertyTax')/12,ins=val('insurance')/12,extras=val('hoa')+val('pmi');put('monthlyTotal',pi+tax+ins+extras);put('principalInterest',pi);put('taxMonthly',tax);put('insuranceMonthly',ins);put('extrasMonthly',extras);put('totalInterest',pi*months-principal)}
function personal(){const principal=val('personalAmount'),months=Math.max(1,val('personalMonths')),payment=pay(principal,val('personalRate'),months);put('personalPayment',payment);put('personalTotal',payment*months);put('personalInterest',payment*months-principal)}
function autoLoan(){const price=val('autoPrice'),principal=Math.max(0,price+price*val('autoTax')/100-val('autoDown')-val('autoTrade')),months=Math.max(1,val('autoMonths')),payment=pay(principal,val('autoRate'),months);put('autoPayment',payment);put('autoFinanced',principal);put('autoInterest',payment*months-principal)}
function salary(){const weekly=val('hourlyRate')*val('hoursWeek'),annual=weekly*val('weeksYear');put('salaryAnnual',annual);put('salaryWeekly',weekly);put('salaryBiweekly',annual/26);put('salaryMonthly',annual/12)}
function afford(){const housing=Math.max(0,val('affordIncome')/12*.36-val('affordDebts')),pi=Math.max(0,housing-val('affordCosts')),months=val('affordYears')*12,r=val('affordRate')/100/12,loan=r===0?pi*months:pi*(Math.pow(1+r,months)-1)/(r*Math.pow(1+r,months));put('affordPrice',loan+val('affordDown'));put('affordBudget',housing);put('affordLoan',loan)}
const calculators={mortgage,personal,auto:autoLoan,salary,afford};
const type=document.body.dataset.calculator,calculate=calculators[type];
document.querySelector('form')?.addEventListener('input',calculate);calculate?.();
let current='es';document.getElementById('lang')?.addEventListener('click',()=>{current=current==='es'?'en':'es';document.documentElement.lang=current;document.getElementById('lang').textContent=current==='es'?'EN':'ES';document.querySelectorAll('[data-es]').forEach(el=>el.innerHTML=el.dataset[current])});
