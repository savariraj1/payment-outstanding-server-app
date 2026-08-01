const { getInvoices } = require("../services/googleSheetService");

const calculateAgeing = require("../services/ageingService");


exports.getAllInvoices = async (req, res) => {

    try {

        const invoices = await getInvoices();


        res.json({
            success:true,
            count: invoices.length,
            data: invoices
        });


    } catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};