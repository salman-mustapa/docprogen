// templates.js
const formatMoney = (amount, currency = 'IDR') => {
    if (!amount) return '0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

// Template engine untuk rendering dinamis
const renderTemplate = (template, data) => {
    let rendered = template;
    
    // Replace placeholders with actual data
    rendered = rendered.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
        const keys = path.split('.');
        let value = data;
        
        for (const key of keys) {
            value = value?.[key];
        }
        
        return value !== undefined ? value : '';
    });
    
    // Handle conditional blocks
    rendered = rendered.replace(/\{\{\#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
        const value = getNestedValue(data, condition);
        return value ? content : '';
    });
    
    // Handle loops
    rendered = rendered.replace(/\{\{\#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayName, content) => {
        const array = getNestedValue(data, arrayName);
        if (!Array.isArray(array)) return '';
        
        return array.map((item, index) => {
            let itemContent = content;
            itemContent = itemContent.replace(/\{\{this\}\}/g, item);
            itemContent = itemContent.replace(/\{\{@index\}\}/g, index);
            return itemContent;
        }).join('');
    });
    
    return rendered;
};

const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
};

const documentTemplates = {
    // Proposal Template
    proposal: (data) => {
        const template = `
    <div class="w-full max-w-[210mm] mx-auto bg-white text-gray-800 font-quicksand text-sm leading-relaxed" style="padding: 2.5cm; font-family: 'Quicksand', sans-serif;">
        <div class="flex justify-between items-end border-b-2 border-gray-800 pb-6 mb-10">
            <div>
                <h1 class="text-4xl font-bold text-gray-900 tracking-tight">PROPOSAL</h1>
                <p class="text-gray-500 mt-1 text-xs tracking-wider uppercase">Project Development Proposal</p>
            </div>
            <div class="text-right">
                <p class="font-bold text-lg">{{settings.your_name}}</p>
                <p class="text-xs text-gray-500">{{settings.your_email}}</p>
                <p class="text-xs text-gray-500">Date: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-12 mb-12">
            <div>
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Prepared For</h3>
                <p class="font-bold text-base text-gray-900">{{client.name}}</p>
                <p class="text-gray-600">{{client.company}}</p>
                <p class="text-gray-600 text-xs mt-1">{{client.email}}</p>
            </div>
            <div class="text-right">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Project Details</h3>
                <p class="font-bold text-base text-gray-900">{{project.project_title}}</p>
                <p class="text-gray-600 text-xs">ID: {{project.project_id}}</p>
                <p class="text-gray-600 text-xs">Valid Until: ${new Date(new Date().setDate(new Date().getDate() + 30)).toLocaleDateString('id-ID')}</p>
            </div>
        </div>

        <div class="mb-10 break-inside-avoid">
            <h2 class="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">Executive Summary</h2>
            <p class="text-gray-600 text-justify leading-loose">
                {{#if project.long_description}}{{project.long_description}}{{else}}{{project.short_description}}{{/if}}
            </p>
        </div>

        <div class="mb-10 break-inside-avoid">
            <h2 class="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Scope of Work</h2>
            <div class="bg-gray-50 p-6 rounded-sm border border-gray-100">
                <p class="text-gray-700 mb-4 italic">{{project.short_description}}</p>
                {{#if project.project_features}}
                <ul class="grid grid-cols-1 gap-2">
                    {{#each project.project_features}}
                    <li class="flex items-start text-xs">
                        <span class="mr-2 text-indigo-600">▪</span> {{this}}
                    </li>
                    {{/each}}
                </ul>
                {{/if}}
            </div>
        </div>

        <div class="grid grid-cols-2 gap-8 mb-12 break-inside-avoid">
            <div>
                <h2 class="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Timeline</h2>
                <table class="w-full text-xs">
                    <tr>
                        <td class="py-2 text-gray-500 font-medium">Start Date</td>
                        <td class="py-2 text-right font-bold">{{project.start_date}}</td>
                    </tr>
                    <tr class="border-t border-gray-100">
                        <td class="py-2 text-gray-500 font-medium">Est. Completion</td>
                        <td class="py-2 text-right font-bold">{{project.end_date}}</td>
                    </tr>
                </table>
            </div>
            <div>
                <h2 class="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Investment</h2>
                <div class="text-right">
                    <p class="text-3xl font-bold text-indigo-900">${formatMoney(data.project?.budget, data.settings?.default_currency)}</p>
                    <p class="text-xs text-gray-500 mt-1">Excluding Tax (if applicable)</p>
                    <p class="text-xs text-gray-500 mt-2 italic">Terms: {{project.payment_terms}}</p>
                </div>
            </div>
        </div>

        <div class="mt-20 pt-8 border-t border-gray-200 break-inside-avoid">
            <div class="grid grid-cols-2 gap-16">
                <div>
                    <p class="text-xs font-bold uppercase tracking-wider mb-12 text-gray-400">Accepted By (Client)</p>
                    <div class="border-b border-gray-900 mb-2"></div>
                    <p class="font-bold text-sm">{{client.name}}</p>
                </div>
                <div>
                    <p class="text-xs font-bold uppercase tracking-wider mb-12 text-gray-400">Proposed By</p>
                    <div class="border-b border-gray-900 mb-2"></div>
                    <p class="font-bold text-sm">{{settings.your_name}}</p>
                </div>
            </div>
        </div>
    </div>
    `;
        
        return renderTemplate(template, data);
    },

    // Contract Template
    contract: (data) => {
        const template = `
    <div class="w-full max-w-[210mm] mx-auto bg-white text-gray-800 font-quicksand text-sm leading-relaxed" style="padding: 2.5cm; font-family: 'Quicksand', sans-serif;">
        <div class="text-center mb-12">
            <h1 class="text-2xl font-bold uppercase tracking-widest border-b-2 border-gray-900 inline-block pb-1 mb-2">Service Agreement</h1>
            <p class="text-xs text-gray-500">Reference No: {{project.project_id}}/CTR/${new Date().getFullYear()}</p>
        </div>

        <div class="mb-8 text-justify">
            <p class="mb-4">This Service Agreement ("Agreement") is made effective as of <strong>${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>, by and between:</p>
            
            <div class="flex gap-8 mb-6 ml-4 text-sm">
                <div class="w-1/2">
                    <strong class="block uppercase text-xs text-gray-500 mb-1">Party A (Service Provider)</strong>
                    <p class="font-bold">{{settings.your_name}}</p>
                    <p>{{settings.your_title}}</p>
                    <p>{{settings.your_email}}</p>
                </div>
                <div class="w-1/2">
                    <strong class="block uppercase text-xs text-gray-500 mb-1">Party B (Client)</strong>
                    <p class="font-bold">{{client.name}}</p>
                    <p>{{client.company}}</p>
                    <p>{{client.email}}</p>
                </div>
            </div>
        </div>

        <div class="space-y-6">
            <div class="break-inside-avoid">
                <h3 class="font-bold text-base uppercase mb-2">1. Services Provided</h3>
                <p class="mb-2">Party A agrees to provide the following services for the project <strong>"{{project.project_title}}"</strong>:</p>
                <div class="bg-gray-50 p-4 text-xs border-l-4 border-gray-300 italic">
                    {{#if project.short_description}}{{project.short_description}}{{else}}As described in the attached proposal.{{/if}}
                </div>
            </div>

            <div class="break-inside-avoid">
                <h3 class="font-bold text-base uppercase mb-2">2. Compensation</h3>
                <p>Party B agrees to pay Party A a total fee of <strong>${formatMoney(data.project?.budget, data.settings?.default_currency)}</strong>.</p>
                <p class="mt-1"><strong>Payment Terms:</strong> {{project.payment_terms}}.</p>
            </div>

            <div class="break-inside-avoid">
                <h3 class="font-bold text-base uppercase mb-2">3. Timeline</h3>
                <p>The services will commence on <strong>{{project.start_date}}</strong> and are expected to be completed by <strong>{{project.end_date}}</strong>.</p>
            </div>

            <div class="break-inside-avoid">
                <h3 class="font-bold text-base uppercase mb-2">4. Confidentiality</h3>
                <p>Both parties agree to keep all proprietary information exchanged during this project confidential and used solely for the purpose of this Agreement.</p>
            </div>
            
            <div class="break-inside-avoid">
                <h3 class="font-bold text-base uppercase mb-2">5. Deliverables</h3>
                <ul class="list-disc pl-5 text-sm">
                    {{#if project.deliverables}}
                    {{#each project.deliverables}}
                    <li>{{this}}</li>
                    {{/each}}
                    {{else}}
                    <li>As detailed in project scope.</li>
                    {{/if}}
                </ul>
            </div>
        </div>

        <div class="mt-24 pt-8 break-inside-avoid">
            <p class="mb-8 text-center italic text-xs text-gray-500">IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.</p>
            <div class="grid grid-cols-2 gap-12">
                <div>
                    <div class="h-20 border-b border-gray-400 mb-2"></div>
                    <p class="font-bold text-sm">{{settings.your_name}}</p>
                    <p class="text-xs text-gray-500">Service Provider</p>
                </div>
                <div>
                    <div class="h-20 border-b border-gray-400 mb-2"></div>
                    <p class="font-bold text-sm">{{client.name}}</p>
                    <p class="text-xs text-gray-500">Client</p>
                </div>
            </div>
        </div>
    </div>
    `;
        
        return renderTemplate(template, data);
    },

    // Invoice Template
    invoice: (data) => {
        const template = `
    <div class="w-full max-w-[210mm] mx-auto bg-white text-gray-800 font-quicksand text-sm leading-relaxed" style="padding: 2.5cm; font-family: 'Quicksand', sans-serif;">
        <div class="flex justify-between items-start mb-12">
            <div>
                <h1 class="text-5xl font-black text-indigo-900 tracking-tighter mb-1">INVOICE</h1>
                <p class="text-indigo-600 font-bold">#{{project.project_id}}-INV</p>
            </div>
            <div class="text-right">
                <h3 class="font-bold text-gray-900">{{settings.your_name}}</h3>
                <p class="text-gray-500 text-xs">{{settings.your_title}}</p>
                <p class="text-gray-500 text-xs">{{settings.your_email}}</p>
                <p class="text-gray-500 text-xs">{{settings.your_phone}}</p>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-10 mb-12">
            <div>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</p>
                <h2 class="font-bold text-lg text-gray-900">{{client.name}}</h2>
                <p class="text-gray-600">{{client.company}}</p>
                <p class="text-gray-600 text-xs">{{client.email}}</p>
            </div>
            <div class="text-right">
                <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Invoice Date</p>
                <p class="font-bold text-gray-900 mb-4">${new Date().toLocaleDateString('id-ID', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
                
                <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Due Date</p>
                <p class="font-bold text-gray-900">Upon Receipt</p>
            </div>
        </div>

        <div class="mb-12">
            <table class="w-full">
                <thead class="bg-gray-900 text-white">
                    <tr>
                        <th class="py-3 px-4 text-left text-xs uppercase tracking-wider rounded-tl-md rounded-bl-md">Description</th>
                        <th class="py-3 px-4 text-center text-xs uppercase tracking-wider w-20">Qty</th>
                        <th class="py-3 px-4 text-right text-xs uppercase tracking-wider w-40 rounded-tr-md rounded-br-md">Amount</th>
                    </tr>
                </thead>
                <tbody class="text-sm">
                    <tr class="border-b border-gray-100">
                        <td class="py-4 px-4">
                            <p class="font-bold text-gray-900">{{project.project_title}}</p>
                            <p class="text-xs text-gray-500 mt-1">{{project.short_description}}</p>
                        </td>
                        <td class="py-4 px-4 text-center text-gray-600">1</td>
                        <td class="py-4 px-4 text-right font-bold text-gray-900">${formatMoney(data.project?.budget, data.settings?.default_currency)}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="flex justify-end mb-16 break-inside-avoid">
            <div class="w-1/2">
                <div class="flex justify-between py-2 text-gray-600 text-xs">
                    <span>Subtotal</span>
                    <span>${formatMoney(data.project?.budget, data.settings?.default_currency)}</span>
                </div>
                <div class="flex justify-between py-2 text-gray-600 text-xs">
                    <span>Tax (0%)</span>
                    <span>${formatMoney(0, data.settings?.default_currency)}</span>
                </div>
                <div class="flex justify-between py-3 border-t-2 border-indigo-100 mt-2 text-indigo-900">
                    <span class="font-bold text-base">Total Due</span>
                    <span class="font-black text-xl">${formatMoney(data.project?.budget, data.settings?.default_currency)}</span>
                </div>
            </div>
        </div>

        <div class="bg-gray-50 p-6 rounded-lg border border-gray-200 break-inside-avoid">
            <h4 class="font-bold text-xs text-gray-900 uppercase mb-2">Payment Information</h4>
            <p class="text-xs text-gray-600 mb-1">Bank Name: <strong>BCA / Mandiri / Jago</strong> (Example)</p>
            <p class="text-xs text-gray-600 mb-1">Account Name: <strong>{{settings.your_name}}</strong></p>
            <p class="text-xs text-gray-600">Account No: <strong>1234-5678-9000</strong></p>
            <p class="text-xs text-gray-400 mt-4 italic">Please include Invoice #{{project.project_id}} in the transfer description.</p>
        </div>
    </div>
    `;
        
        return renderTemplate(template, data);
    },

    // RAB Template
    rab: (data) => {
        const template = `
    <div class="w-full max-w-[210mm] mx-auto bg-white text-gray-800 font-quicksand text-sm leading-relaxed" style="padding: 2.5cm; font-family: 'Quicksand', sans-serif;">
        <div class="text-center border-b-4 border-indigo-600 pb-6 mb-8">
            <h1 class="text-3xl font-bold text-gray-900">RAB</h1>
            <p class="text-sm text-gray-500 mt-1 tracking-wide uppercase">Rencana Anggaran Biaya</p>
        </div>

        <div class="grid grid-cols-2 gap-8 mb-8 text-xs">
            <div>
                <p class="text-gray-500 uppercase">Project</p>
                <p class="font-bold text-base mb-2">{{project.project_title}}</p>
                <p class="text-gray-500 uppercase">Client</p>
                <p class="font-bold">{{client.name}}</p>
            </div>
            <div class="text-right">
                <p class="text-gray-500 uppercase">Date</p>
                <p class="font-bold mb-2">${new Date().toLocaleDateString('id-ID')}</p>
                <p class="text-gray-500 uppercase">Estimated Duration</p>
                <p class="font-bold">2 - 4 Weeks</p>
            </div>
        </div>

        <div class="mb-8">
            <h3 class="font-bold text-indigo-900 border-b border-indigo-100 pb-2 mb-4">1. Pengembangan Aplikasi</h3>
            <table class="w-full text-xs mb-6">
                <thead class="bg-gray-100 text-gray-600">
                    <tr>
                        <th class="py-2 px-3 text-left">Item</th>
                        <th class="py-2 px-3 text-left w-1/3">Keterangan</th>
                        <th class="py-2 px-3 text-right w-1/4">Biaya</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="border-b border-gray-50">
                        <td class="py-2 px-3 font-medium">Full Stack Development</td>
                        <td class="py-2 px-3 text-gray-500">Frontend, Backend, DB</td>
                        <td class="py-2 px-3 text-right font-mono text-gray-700">${formatMoney(data.project?.budget, data.settings?.default_currency)}</td>
                    </tr>
                    <tr class="border-b border-gray-50">
                        <td class="py-2 px-3 font-medium">UI/UX Design</td>
                        <td class="py-2 px-3 text-gray-500">Mockups & Assets</td>
                        <td class="py-2 px-3 text-right font-mono text-gray-700">Included</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="mb-8 break-inside-avoid">
            <h3 class="font-bold text-indigo-900 border-b border-indigo-100 pb-2 mb-4">2. Infrastruktur & Deployment</h3>
            <table class="w-full text-xs mb-6">
                <thead class="bg-gray-100 text-gray-600">
                    <tr>
                        <th class="py-2 px-3 text-left">Item</th>
                        <th class="py-2 px-3 text-left w-1/3">Keterangan</th>
                        <th class="py-2 px-3 text-right w-1/4">Biaya</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="border-b border-gray-50">
                        <td class="py-2 px-3 font-medium">Cloud Hosting / VPS</td>
                        <td class="py-2 px-3 text-gray-500">Per Tahun</td>
                        <td class="py-2 px-3 text-right font-mono text-gray-700">${formatMoney(500000, data.settings?.default_currency)}</td>
                    </tr>
                    <tr class="border-b border-gray-50">
                        <td class="py-2 px-3 font-medium">Domain (.com/.id)</td>
                        <td class="py-2 px-3 text-gray-500">Per Tahun</td>
                        <td class="py-2 px-3 text-right font-mono text-gray-700">${formatMoney(200000, data.settings?.default_currency)}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="bg-indigo-900 text-white p-6 rounded-sm flex justify-between items-center break-inside-avoid">
            <span class="font-bold text-lg uppercase tracking-wide">Grand Total Estimasi</span>
            <span class="font-mono text-2xl font-bold">${formatMoney(parseInt(data.project?.budget || 0) + 700000, data.settings?.default_currency)}</span>
        </div>

        <div class="mt-12 text-center text-xs text-gray-400 italic break-inside-avoid">
            <p>* Harga infrastruktur dapat berubah sesuai penyedia layanan.</p>
            <p>* Harga belum termasuk PPN jika ada.</p>
        </div>
    </div>
    `;
        
        return renderTemplate(template, data);
    },

    // SRS Template
    srs: (data) => {
        const template = `
    <div class="w-full max-w-[210mm] mx-auto bg-white text-gray-800 font-quicksand text-sm leading-relaxed" style="padding: 2.5cm; font-family: 'Quicksand', sans-serif;">
        <div class="text-center mb-16 pt-10">
            <p class="text-xs font-bold tracking-[0.3em] uppercase text-gray-400 mb-2">Software Requirements Specification</p>
            <h1 class="text-4xl font-bold text-gray-900 mb-4">{{project.project_title}}</h1>
            <p class="text-gray-600">Version 1.0</p>
        </div>

        <div class="mb-12 p-6 border border-gray-200 rounded bg-gray-50 text-xs">
            <div class="grid grid-cols-2 gap-4">
                <div><strong>Client:</strong> {{client.name}}</div>
                <div><strong>Date:</strong> ${new Date().toLocaleDateString('id-ID')}</div>
                <div><strong>Author:</strong> {{settings.your_name}}</div>
                <div><strong>Status:</strong> Draft</div>
            </div>
        </div>

        <div class="mb-10">
            <h2 class="text-base font-bold uppercase tracking-wide text-indigo-900 border-b border-indigo-100 pb-2 mb-4">1. Introduction</h2>
            <div class="pl-4 border-l-2 border-gray-200">
                <h3 class="font-bold text-sm mb-1">1.1 Purpose</h3>
                <p class="text-gray-600 mb-4">{{#if project.short_description}}{{project.short_description}}{{else}}To define the requirements for the system.{{/if}}</p>
                
                <h3 class="font-bold text-sm mb-1">1.2 Scope</h3>
                <p class="text-gray-600">{{#if project.long_description}}{{project.long_description}}{{else}}Full stack application development.{{/if}}</p>
            </div>
        </div>

        <div class="mb-10 break-inside-avoid">
            <h2 class="text-base font-bold uppercase tracking-wide text-indigo-900 border-b border-indigo-100 pb-2 mb-4">2. Functional Requirements</h2>
            <div class="overflow-hidden rounded border border-gray-200">
                <table class="w-full text-xs">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="py-2 px-4 text-left w-16 border-r border-gray-200">ID</th>
                            <th class="py-2 px-4 text-left">Requirement Description</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        {{#if project.project_features}}
                        {{#each project.project_features}}
                        <tr>
                            <td class="py-3 px-4 font-mono text-gray-500 border-r border-gray-100">FR-{{add @index 1}}</td>
                            <td class="py-3 px-4">{{this}}</td>
                        </tr>
                        {{/each}}
                        {{else}}
                        <tr><td colspan="2" class="p-4 text-center text-gray-400">No features listed</td></tr>
                        {{/if}}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="mb-10 break-inside-avoid">
            <h2 class="text-base font-bold uppercase tracking-wide text-indigo-900 border-b border-indigo-100 pb-2 mb-4">3. Non-Functional Requirements</h2>
            <ul class="list-disc pl-5 space-y-2 text-xs text-gray-700">
                <li><strong>Performance:</strong> System shall load initial dashboard in under 2 seconds.</li>
                <li><strong>Security:</strong> All passwords must be hashed (bcrypt). SSL required.</li>
                <li><strong>Reliability:</strong> 99.9% Uptime SLA.</li>
            </ul>
        </div>

        <div class="mt-12 pt-12 border-t border-gray-200 text-center">
            <p class="text-xs text-gray-400 uppercase tracking-widest">End of Document</p>
        </div>
    </div>
    `;
        
        return renderTemplate(template, data);
    },

    // templates.js - Tambahkan template CV Summary
    cv_summary: (data) => {
        const { client, project, settings } = data || {};
        const currency = settings?.default_currency || 'IDR';
        
        return `
        <div class="w-full max-w-[210mm] mx-auto bg-white text-gray-800 font-quicksand text-sm leading-relaxed" style="padding: 2.5cm; font-family: 'Quicksand', sans-serif;">
            <div class="text-center mb-12 pt-10">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Curriculum Vitae</h1>
                <p class="text-gray-600">${settings?.your_name || 'Your Name'}</p>
            </div>

            <div class="mb-8">
                <h2 class="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Personal Information</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-500">Name</p>
                        <p class="font-medium text-gray-800">${settings?.your_name || ''}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Title</p>
                        <p class="font-medium text-gray-800">${settings?.your_title || ''}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Email</p>
                        <p class="font-medium text-gray-800">${settings?.your_email || ''}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Phone</p>
                        <p class="font-medium text-gray-800">${settings?.your_phone || ''}</p>
                    </div>
                </div>
            </div>

            <div class="mb-8">
                <h2 class="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Professional Summary</h2>
                <p class="text-gray-600 text-justify leading-loose">
                    Experienced ${settings?.your_title || 'developer'} with a proven track record of delivering high-quality projects on time and within budget. 
                    Specialized in creating custom solutions that meet client needs and exceed expectations.
                </p>
            </div>

            <div class="mb-8">
                <h2 class="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Recent Projects</h2>
                <div class="space-y-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="font-medium text-gray-800 mb-2">${project?.project_title || 'Recent Project'}</h3>
                        <p class="text-gray-600 mb-2">${project?.short_description || 'Project description'}</p>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                                <p class="text-gray-500">Client</p>
                                <p class="font-medium">${client?.name || 'Client Name'}</p>
                            </div>
                            <div>
                                <p class="text-gray-500">Budget</p>
                                <p class="font-medium">${formatMoney(project?.budget, currency)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mb-8">
                <h2 class="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Skills</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div class="bg-gray-50 p-3 rounded">Frontend Development</div>
                    <div class="bg-gray-50 p-3 rounded">Backend Development</div>
                    <div class="bg-gray-50 p-3 rounded">Database Management</div>
                    <div class="bg-gray-50 p-3 rounded">UI/UX Design</div>
                    <div class="bg-gray-50 p-3 rounded">Project Management</div>
                    <div class="bg-gray-50 p-3 rounded">Client Communication</div>
                    <div class="bg-gray-50 p-3 rounded">Problem Solving</div>
                </div>
            </div>

            <div class="mt-12 pt-8 border-t border-gray-200 text-center">
                <p class="text-xs text-gray-400">Generated on ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
        </div>
        `;
    },

    // UAT Template
    uat: (data) => {
        const template = `
    <div class="w-full max-w-[210mm] mx-auto bg-white text-gray-800 font-quicksand text-sm leading-relaxed" style="padding: 2.5cm; font-family: 'Quicksand', sans-serif;">
        <div class="flex justify-between items-center mb-8 border-b-2 border-gray-800 pb-4">
            <h1 class="text-2xl font-bold text-gray-900">User Acceptance Test (UAT)</h1>
            <div class="text-right">
                <p class="text-xs font-bold uppercase text-gray-500">Doc ID</p>
                <p class="font-mono text-sm">{{project.project_id}}-UAT</p>
            </div>
        </div>

        <div class="bg-gray-50 p-4 rounded mb-8 text-xs">
             <div class="grid grid-cols-2 gap-4">
                <div><strong>Tester Name:</strong> {{client.name}}</div>
                <div><strong>Test Date:</strong> ________________</div>
                <div><strong>Project:</strong> {{project.project_title}}</div>
                <div><strong>Version:</strong> 1.0</div>
            </div>
        </div>

        <table class="w-full text-xs border-collapse border border-gray-300 mb-8">
            <thead class="bg-gray-800 text-white">
                <tr>
                    <th class="p-2 border border-gray-600 w-16">ID</th>
                    <th class="p-2 border border-gray-600">Test Case / Feature</th>
                    <th class="p-2 border border-gray-600 w-24 text-center">Pass</th>
                    <th class="p-2 border border-gray-600 w-24 text-center">Fail</th>
                    <th class="p-2 border border-gray-600 w-1/3">Remarks</th>
                </tr>
            </thead>
            <tbody>
                {{#if project.project_features}}
                {{#each project.project_features}}
                <tr class="break-inside-avoid">
                    <td class="p-3 border border-gray-300 font-mono text-center text-gray-500">TC-{{add @index 1}}</td>
                    <td class="p-3 border border-gray-300 font-medium">{{this}}</td>
                    <td class="p-3 border border-gray-300 text-center"><div class="w-4 h-4 border border-gray-400 mx-auto rounded-sm"></div></td>
                    <td class="p-3 border border-gray-300 text-center"><div class="w-4 h-4 border border-gray-400 mx-auto rounded-sm"></div></td>
                    <td class="p-3 border border-gray-300"></td>
                </tr>
                {{/each}}
                {{/if}}
            </tbody>
        </table>

        <div class="mt-8 break-inside-avoid">
            <h3 class="font-bold mb-4">Sign-off</h3>
            <p class="text-xs text-gray-600 mb-8">By signing below, the client confirms that the features marked as "Pass" work as expected.</p>
            
            <div class="flex justify-between gap-12">
                <div class="w-1/2 border-t border-gray-400 pt-2">
                    <p class="font-bold text-sm">{{client.name}}</p>
                    <p class="text-xs text-gray-500">Client Signature</p>
                </div>
                <div class="w-1/2 border-t border-gray-400 pt-2">
                    <p class="font-bold text-sm">{{settings.your_name}}</p>
                    <p class="text-xs text-gray-500">Developer Signature</p>
                </div>
            </div>
        </div>
    </div>
    `;
        
        return renderTemplate(template, data);
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { documentTemplates };
}