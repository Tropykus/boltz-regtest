import bolt11 from 'bolt11';  

export const validateInvoice = (invoice: string)=>{
    try {
        const decoded = bolt11.decode(invoice);
        if (!decoded.prefix?.startsWith('lnbcrt')) {
            throw new Error('La factura no es para regtest.');
        }
        return decoded;
    }
    catch (e) {
        console.error(e);
        return null;
    }
}