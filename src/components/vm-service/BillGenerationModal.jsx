import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
    FileText,
    Download,
    Calculator,
    Save,
    X,
    Plus,
    Trash2,
    Wrench,
    Droplets,
    Loader2,
    Share2,
    Mail,
    Send
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { serviceTypes } from '../../config/menuConfig';
import { billGenerationAPI } from '../../services/api';

const BillGenerationModal = ({
    isOpen,
    booking,
    existingBill = null,
    mode = 'create', // 'create' or 'edit'
    loadingBill = false,
    onClose,
    onSave
}) => {
    // Debug: Log all props when component renders
    console.log('BillGenerationModal props:', {
        isOpen,
        booking,
        existingBill,
        mode,
        loadingBill
    });
    const [billData, setBillData] = useState({
        serviceCharges: 0,
        laborCharges: 0,
        additionalCharges: 0,
        discount: 0,
        notes: '',
        paymentStatus: 'PENDING',
        // Additional services
        waterWash: false,
        waterWashCharges: 200,
        // Parts and consumables
        parts: [],
        // Service details
        workDescription: ''
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareEmail, setShareEmail] = useState('');
    const [isSharingBill, setIsSharingBill] = useState(false);

    // Add new part to the list
    const addPart = () => {
        setBillData(prev => ({
            ...prev,
            parts: [...prev.parts, {
                id: Date.now(),
                name: '',
                quantity: 1,
                unitPrice: 0,
                total: 0
            }]
        }));
    };

    // Remove part from the list
    const removePart = (partId) => {
        setBillData(prev => ({
            ...prev,
            parts: prev.parts.filter(part => part.id !== partId)
        }));
    };

    // Update part details
    const updatePart = (partId, field, value) => {
        setBillData(prev => ({
            ...prev,
            parts: prev.parts.map(part => {
                if (part.id === partId) {
                    const updatedPart = { ...part, [field]: value };
                    // Calculate total when quantity or unitPrice changes
                    if (field === 'quantity' || field === 'unitPrice') {
                        updatedPart.total = (updatedPart.quantity || 0) * (updatedPart.unitPrice || 0);
                    }
                    return updatedPart;
                }
                return part;
            })
        }));
    };

    // Calculate total parts cost
    const calculatePartsTotal = () => {
        return billData.parts.reduce((total, part) => total + (part.total || 0), 0);
    };

    const { toast } = useToast();

    // Debug: Log current billData state
    useEffect(() => {
        console.log('Current billData state:', billData);
    }, [billData]);

    // Initialize bill data when booking or existing bill changes
    useEffect(() => {
        console.log('BillModal useEffect triggered:', {
            booking: !!booking,
            mode,
            existingBill: !!existingBill,
            loadingBill,
            existingBillData: existingBill
        });

        if (booking) {
            if (mode === 'edit' && existingBill && !loadingBill) {
                // Load existing bill data for editing (only when not loading)
                console.log('Loading existing bill data into form:', existingBill);
                console.log('Existing bill serviceCharges:', existingBill.serviceCharges);
                console.log('Existing bill parts:', existingBill.parts);

                const newBillData = {
                    serviceCharges: existingBill.serviceCharges || 0,
                    laborCharges: existingBill.laborCharges || 0,
                    additionalCharges: existingBill.additionalCharges || 0,
                    discount: existingBill.discount || 0,
                    notes: existingBill.notes || '',
                    paymentStatus: existingBill.paymentStatus || 'PENDING',
                    // Additional services
                    waterWash: existingBill.waterWash || false,
                    waterWashCharges: existingBill.waterWashCharges || 200,
                    // Parts and consumables
                    parts: existingBill.parts || [],
                    // Service details
                    workDescription: existingBill.workDescription || `${getServiceTypeName(booking.serviceType)} service performed`
                };

                console.log('Setting bill data to:', newBillData);
                setBillData(newBillData);
            } else if (mode === 'create') {
                console.log('Creating new bill data for booking:', booking.bookingId);
                // Initialize new bill data
                setBillData({
                    serviceCharges: parseFloat(booking.estimatedCost?.replace(/[^\d.]/g, '') || 0),
                    laborCharges: 0,
                    additionalCharges: 0,
                    discount: 0,
                    notes: '',
                    paymentStatus: 'PENDING',
                    // Additional services
                    waterWash: false,
                    waterWashCharges: 200,
                    // Parts and consumables
                    parts: [],
                    // Service details
                    workDescription: `${getServiceTypeName(booking.serviceType)} service performed`
                });
            } else {
                console.log('Conditions not met for bill data initialization:', {
                    mode,
                    hasExistingBill: !!existingBill,
                    loadingBill
                });
            }
            // If loadingBill is true, don't update billData yet - wait for existingBill
        }
    }, [booking, existingBill, mode, loadingBill]);

    // Calculate bill totals
    const calculateBillTotals = () => {
        const { serviceCharges, laborCharges, additionalCharges, discount, waterWash, waterWashCharges } = billData;
        const partsTotal = calculatePartsTotal();
        const waterWashTotal = waterWash ? waterWashCharges : 0;

        const subtotal = serviceCharges + partsTotal + laborCharges + additionalCharges + waterWashTotal;
        const discountAmount = (subtotal * discount) / 100;
        const total = subtotal - discountAmount;

        return {
            subtotal,
            partsTotal,
            waterWashTotal,
            discountAmount,
            total
        };
    };


    // Handle number input changes with proper formatting
    const handleNumberInputChange = (field, value) => {
        // Remove leading zeros and non-numeric characters except decimal point
        const cleanValue = value.replace(/^0+/, '') || '0';
        const numericValue = cleanValue === '' ? 0 : parseFloat(cleanValue) || 0;

        setBillData(prev => ({
            ...prev,
            [field]: numericValue
        }));
    };

    // Handle bill save
    const handleBillSave = async () => {
        if (isSaving) return; // Prevent multiple submissions

        try {
            setIsSaving(true);
            const totals = calculateBillTotals();

            // Validate required fields
            if (!booking.bookingId) {
                toast.error('Validation Error', 'Booking ID is required to generate bill.');
                setIsSaving(false);
                return;
            }

            if (totals.total <= 0) {
                toast.error('Validation Error', 'Total amount must be greater than zero.');
                setIsSaving(false);
                return;
            }

            // Prepare bill data according to API specification
            const billPayload = {
                billNumber: `VM-${booking.bookingId}-${Date.now().toString().slice(-6)}`,
                bookingId: booking.bookingId,
                billDate: new Date().toISOString(),
                serviceCharges: billData.serviceCharges || 0,
                laborCharges: billData.laborCharges || 0,
                partsTotal: totals.partsTotal || 0,
                waterWash: billData.waterWash || false,
                waterWashCharges: billData.waterWashCharges || 0,
                waterWashTotal: totals.waterWashTotal || 0,
                additionalCharges: billData.additionalCharges || 0,
                subtotal: totals.subtotal,
                discount: billData.discount || 0,
                discountAmount: totals.discountAmount || 0,
                total: totals.total,
                paymentStatus: billData.paymentStatus || 'PENDING',
                workDescription: billData.workDescription || '',
                notes: billData.notes || '',
                parts: billData.parts || []
            };

            console.log('Sending bill data to parent handler:', billPayload);

            // Let parent handle the API call to avoid duplicate calls
            await onSave(billPayload);
            onClose();
        } catch (error) {
            console.error('Error preparing bill data:', error);
            toast.error('Error', error.message || 'Failed to save bill. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle PDF generation and download
    const handlePdfDownload = async () => {
        if (isGeneratingPdf) return; // Prevent multiple requests

        try {
            setIsGeneratingPdf(true);

            // Get the bill content HTML
            const billContent = document.querySelector('.bg-white.rounded-lg.shadow-xl');
            if (!billContent) {
                toast.error('Error', 'Could not find bill content to generate PDF.');
                return;
            }

            // Get the inner HTML of the bill content, excluding the modal header and footer
            const billInnerContent = billContent.querySelector('.relative.p-4.space-y-4');
            if (!billInnerContent) {
                toast.error('Error', 'Could not extract bill content for PDF generation.');
                return;
            }

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Service Bill - ${booking.bookingId}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 0; 
                            padding: 20px; 
                            font-size: 12px;
                            line-height: 1.4;
                        }
                        .bill-container { 
                            max-width: 800px; 
                            margin: 0 auto; 
                        }
                        .grid { display: grid; }
                        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
                        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                        .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
                        .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
                        .col-span-2 { grid-column: span 2 / span 2; }
                        .col-span-4 { grid-column: span 4 / span 4; }
                        .gap-2 { gap: 0.5rem; }
                        .gap-3 { gap: 0.75rem; }
                        .gap-4 { gap: 1rem; }
                        .gap-8 { gap: 2rem; }
                        .space-y-1 > * + * { margin-top: 0.25rem; }
                        .space-y-2 > * + * { margin-top: 0.5rem; }
                        .space-y-3 > * + * { margin-top: 0.75rem; }
                        .space-y-4 > * + * { margin-top: 1rem; }
                        .border { border: 1px solid #d1d5db; }
                        .border-2 { border: 2px solid; }
                        .border-t { border-top: 1px solid #d1d5db; }
                        .border-b { border-bottom: 1px solid #d1d5db; }
                        .border-b-2 { border-bottom: 2px solid; }
                        .border-gray-200 { border-color: #e5e7eb; }
                        .border-gray-300 { border-color: #d1d5db; }
                        .border-gray-400 { border-color: #9ca3af; }
                        .border-blue-200 { border-color: #dbeafe; }
                        .border-blue-300 { border-color: #93c5fd; }
                        .border-green-200 { border-color: #bbf7d0; }
                        .rounded { border-radius: 0.25rem; }
                        .rounded-lg { border-radius: 0.5rem; }
                        .p-2 { padding: 0.5rem; }
                        .p-3 { padding: 0.75rem; }
                        .p-4 { padding: 1rem; }
                        .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
                        .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
                        .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
                        .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
                        .pt-2 { padding-top: 0.5rem; }
                        .pt-3 { padding-top: 0.75rem; }
                        .pt-4 { padding-top: 1rem; }
                        .pb-1 { padding-bottom: 0.25rem; }
                        .pb-4 { padding-bottom: 1rem; }
                        .mb-1 { margin-bottom: 0.25rem; }
                        .mb-2 { margin-bottom: 0.5rem; }
                        .mb-3 { margin-bottom: 0.75rem; }
                        .mt-1 { margin-top: 0.25rem; }
                        .mt-2 { margin-top: 0.5rem; }
                        .mt-4 { margin-top: 1rem; }
                        .mt-6 { margin-top: 1.5rem; }
                        .my-2 { margin-top: 0.5rem; margin-bottom: 0.5rem; }
                        .my-3 { margin-top: 0.75rem; margin-bottom: 0.75rem; }
                        body { font-family: 'Roboto', sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; color: #333; }
                        .bill-container { width: 210mm; min-height: 297mm; margin: 20px auto; background-color: #fff; border: 1px solid #ddd; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); padding: 30px; box-sizing: border-box; }
                        .bill-header { display: flex; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
                        .company-logo img { max-width: 80px; height: auto; margin-right: 20px; }
                        .company-info { flex-grow: 1; }
                        .company-info h1 { font-family: 'Montserrat', sans-serif; font-size: 2.2em; color: #2c3e50; margin: 0 0 5px 0; text-transform: uppercase; }
                        .company-info .tagline { font-size: 0.9em; color: #666; margin-top: 0; margin-bottom: 10px; }
                        .company-info p { font-size: 0.8em; margin: 2px 0; }
                        h2 { font-family: 'Montserrat', sans-serif; font-size: 1.2em; color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 25px; margin-bottom: 15px; text-transform: uppercase; }
                        h3 { font-family: 'Montserrat', sans-serif; font-size: 1em; color: #2c3e50; margin-top: 20px; margin-bottom: 10px; }
                        .bill-details-section .bill-meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; font-size: 0.9em; margin-bottom: 20px; }
                        .bill-details-section .bill-meta-grid div { background-color: #f9f9f9; padding: 8px 12px; border-radius: 4px; }
                        .customer-vehicle-section { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 0.9em; border-bottom: 1px solid #eee; padding-bottom: 20px; }
                        .customer-details, .vehicle-details { flex: 1; padding-right: 20px; }
                        .customer-details p, .vehicle-details p { margin: 5px 0; }
                        .service-details-section table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 30px; }
                        .service-details-section th, .service-details-section td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 0.85em; }
                        .service-details-section th { background-color: #f2f2f2; font-weight: bold; color: #555; }
                        .summary-payment-section { margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
                        .summary-grid { display: flex; justify-content: space-between; gap: 30px; margin-bottom: 20px; }
                        .total-breakdown { flex: 2; }
                        .total-breakdown h3 { margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                        .summary-line { display: flex; justify-content: space-between; padding: 5px 0; font-size: 0.9em; border-bottom: 1px dotted #eee; }
                        .summary-line:last-of-type { border-bottom: none; }
                        .summary-line.highlighted { font-weight: bold; background-color: #e6f7ff; padding: 8px 5px; margin: 5px -5px; border-radius: 3px; border-bottom: none; }
                        .summary-line.final-amount { font-size: 1.1em; font-weight: bold; color: #d35400; border-top: 2px solid #2c3e50; padding-top: 10px; margin-top: 10px; }
                        .payment-info { flex: 1; text-align: right; font-size: 0.85em; }
                        .payment-info p { margin: 5px 0; }
                        .qr-code img { max-width: 100px; height: auto; margin-top: 10px; border: 1px solid #ddd; padding: 5px; background-color: #fff; }
                        .amount-in-words { font-weight: bold; font-style: italic; margin-top: 20px; margin-bottom: 30px; padding: 10px; background-color: #f9f9f9; border: 1px solid #eee; border-radius: 4px; font-size: 0.95em; }
                        .terms-conditions { font-size: 0.8em; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
                        .terms-conditions h3 { margin-top: 0; font-size: 0.9em; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                        .terms-conditions ul { list-style: decimal; padding-left: 20px; margin-top: 10px; }
                        .terms-conditions li { margin-bottom: 5px; }
                        .bill-footer { margin-top: 40px; border-top: 2px solid #eee; padding-top: 20px; text-align: center; font-size: 0.9em; }
                        .signatures { display: flex; justify-content: space-between; margin-bottom: 20px; padding: 0 20px; }
                        .signatures p { flex: 1; text-align: left; }
                        .signatures p:last-child { text-align: right; }
                        .thank-you { font-family: 'Montserrat', sans-serif; font-size: 1.1em; font-weight: bold; color: #2c3e50; margin-top: 20px; }
                        @media print { body { margin: 0; padding: 0; background: none; } .bill-container { box-shadow: none; border: none; margin: 0; width: 100%; min-height: auto; } }
                    </style>
                </head>
                <body>
                    <div class="bill-container">
                        ${billInnerContent.innerHTML}
                    </div>
                </body>
                </html>
            `;

            // Generate filename
            const timestamp = new Date().toISOString().slice(0, 10);
            const filename = `VM_Bill_${booking.bookingId}_${timestamp}.pdf`;

            // Make API call to generate PDF using the API service
            const response = await billGenerationAPI.generatePdf({
                htmlContent: htmlContent,
                filename: filename,
                customCss: '' // CSS is already included in the HTML
            });

            // Get the PDF blob from the response
            const blob = response.data;

            // Create download link and trigger download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('PDF Generated', 'Bill PDF has been downloaded successfully!');

        } catch (error) {
            console.error('Error generating PDF:', error);
            // Use the enhanced error message from API interceptor if available
            const errorMessage = error.userMessage || error.message || 'Failed to generate PDF. Please try again.';
            toast.error('PDF Generation Failed', errorMessage);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    // Handle share bill via email
    const handleShareBill = async () => {
        if (isSharingBill) return; // Prevent multiple submissions

        try {
            setIsSharingBill(true);

            // Validate email
            if (!shareEmail || !shareEmail.trim()) {
                toast.error('Validation Error', 'Please enter an email address.');
                setIsSharingBill(false);
                return;
            }

            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(shareEmail.trim())) {
                toast.error('Validation Error', 'Please enter a valid email address.');
                setIsSharingBill(false);
                return;
            }

            // Check if bill exists
            if (!existingBill || !existingBill.billNumber) {
                toast.error('Error', 'Bill information not found. Please save the bill first.');
                setIsSharingBill(false);
                return;
            }

            // Generate structured HTML content for the bill
            const htmlContent = generateBillHTML();

            // Generate filename
            const timestamp = new Date().toISOString().slice(0, 10);
            const filename = `VM_Bill_${booking.bookingId}_${timestamp}.pdf`;

            // Prepare share data according to EmailWithPdfRequest structure
            const shareData = {
                emailId: shareEmail.trim(),
                billId: existingBill.id?.toString() || existingBill.billNumber || booking.bookingId,
                customerName: booking.customerName,
                htmlContent: htmlContent,
                customCss: '', // CSS is already included in the HTML
                subject: `Service Bill #${existingBill.billNumber} - Venkateswara Motors`,
                filename: filename
            };

            console.log('Sharing bill via email with PDF:', shareData);

            // Call API to send bill via email
            const response = await billGenerationAPI.shareBill(shareData);

            if (response.success) {
                toast.success('Bill Shared Successfully', `Bill has been sent to ${shareEmail}`);
                setShowShareModal(false);
                setShareEmail('');
            } else {
                toast.error('Share Failed', response.message || 'Failed to send bill via email. Please try again.');
            }

        } catch (error) {
            console.error('Error sharing bill:', error);
            const errorMessage = error.userMessage || error.message || 'Failed to send bill via email. Please try again.';
            toast.error('Share Error', errorMessage);
        } finally {
            setIsSharingBill(false);
        }
    };

    // Handle share modal close
    const handleShareModalClose = () => {
        setShowShareModal(false);
        setShareEmail('');
    };

    // Generate structured HTML content for email
    const generateBillHTML = () => {
        const totals = calculateBillTotals();

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Service Bill - ${booking.bookingId}</title>
    <style>
        body { font-family: 'Roboto', sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; color: #333; }
        .bill-container { width: 210mm; min-height: 297mm; margin: 20px auto; background-color: #fff; border: 1px solid #ddd; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); padding: 30px; box-sizing: border-box; }
        .bill-header { display: flex; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .company-logo img { max-width: 80px; height: auto; margin-right: 20px; }
        .company-info { flex-grow: 1; }
        .company-info h1 { font-family: 'Montserrat', sans-serif; font-size: 2.2em; color: #2c3e50; margin: 0 0 5px 0; text-transform: uppercase; }
        .company-info .tagline { font-size: 0.9em; color: #666; margin-top: 0; margin-bottom: 10px; }
        .company-info p { font-size: 0.8em; margin: 2px 0; }
        h2 { font-family: 'Montserrat', sans-serif; font-size: 1.2em; color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 25px; margin-bottom: 15px; text-transform: uppercase; }
        h3 { font-family: 'Montserrat', sans-serif; font-size: 1em; color: #2c3e50; margin-top: 20px; margin-bottom: 10px; }
        .bill-details-section .bill-meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; font-size: 0.9em; margin-bottom: 20px; }
        .bill-details-section .bill-meta-grid div { background-color: #f9f9f9; padding: 8px 12px; border-radius: 4px; }
        .customer-vehicle-section { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 0.9em; border-bottom: 1px solid #eee; padding-bottom: 20px; }
        .customer-details, .vehicle-details { flex: 1; padding-right: 20px; }
        .customer-details p, .vehicle-details p { margin: 5px 0; }
        .service-details-section table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 30px; }
        .service-details-section th, .service-details-section td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 0.85em; }
        .service-details-section th { background-color: #f2f2f2; font-weight: bold; color: #555; }
        .summary-payment-section { margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
        .summary-grid { display: flex; justify-content: space-between; gap: 30px; margin-bottom: 20px; }
        .total-breakdown { flex: 2; }
        .total-breakdown h3 { margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        .summary-line { display: flex; justify-content: space-between; padding: 5px 0; font-size: 0.9em; border-bottom: 1px dotted #eee; }
        .summary-line:last-of-type { border-bottom: none; }
        .summary-line.highlighted { font-weight: bold; background-color: #e6f7ff; padding: 8px 5px; margin: 5px -5px; border-radius: 3px; border-bottom: none; }
        .summary-line.final-amount { font-size: 1.1em; font-weight: bold; color: #d35400; border-top: 2px solid #2c3e50; padding-top: 10px; margin-top: 10px; }
        .payment-info { flex: 1; text-align: right; font-size: 0.85em; }
        .payment-info p { margin: 5px 0; }
        .amount-in-words { font-weight: bold; font-style: italic; margin-top: 20px; margin-bottom: 30px; padding: 10px; background-color: #f9f9f9; border: 1px solid #eee; border-radius: 4px; font-size: 0.95em; }
        .terms-conditions { font-size: 0.8em; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
        .terms-conditions h3 { margin-top: 0; font-size: 0.9em; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        .terms-conditions ul { list-style: decimal; padding-left: 20px; margin-top: 10px; }
        .terms-conditions li { margin-bottom: 5px; }
        .bill-footer { margin-top: 40px; border-top: 2px solid #eee; padding-top: 20px; text-align: center; font-size: 0.9em; }
        .signatures { display: flex; justify-content: space-between; margin-bottom: 20px; padding: 0 20px; }
        .signatures p { flex: 1; text-align: left; }
        .signatures p:last-child { text-align: right; }
        .thank-you { font-family: 'Montserrat', sans-serif; font-size: 1.1em; font-weight: bold; color: #2c3e50; margin-top: 20px; }
        @media print { body { margin: 0; padding: 0; background: none; } .bill-container { box-shadow: none; border: none; margin: 0; width: 100%; min-height: auto; } }
    </style>
</head>
<body>
    <div class="bill-container">
        <div class="header">
            <div class="company-name">VENKATESWARA MOTORS</div>
            <div class="company-tagline">Professional Vehicle Service Center</div>
            <div class="company-details">
                <div>Address: 4WF6+9QG, SH 57, Ma. Po. Si. Nagar, Kakkalur, Tamil Nadu 602001</div>
                <div>Phone: +91-9677464451 | Email: venkateshwaramotors.trl@gmail.com</div>
            </div>
            <div class="invoice-header">
                <div>
                    <div style="font-weight: bold;">Invoice No: VM-${new Date().getFullYear()}-${booking.bookingId.toString().padStart(4, '0')}</div>
                    <div style="font-size: 10px; color: #4b5563;">Date: ${new Date().toLocaleDateString('en-IN')}</div>
                    <div style="font-size: 10px; color: #4b5563;">Time: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div class="invoice-title">SERVICE INVOICE</div>
            </div>
        </div>
        <div class="details-section">
            <div class="detail-box">
                <div class="detail-title">Customer Details</div>
                <div class="detail-row"><span class="detail-label">Name:</span><span class="detail-value">${booking.customerName}</span></div>
                <div class="detail-row"><span class="detail-label">Phone:</span><span class="detail-value">${booking.contactNumber || 'N/A'}</span></div>
                <div class="detail-row"><span class="detail-label">Vehicle:</span><span class="detail-value">${booking.vehicleModel}</span></div>
                <div class="detail-row"><span class="detail-label">Reg. No:</span><span class="detail-value">${booking.vehicleRegNo}</span></div>
            </div>
            <div class="detail-box">
                <div class="detail-title">Service Details</div>
                <div class="detail-row"><span class="detail-label">Service:</span><span class="detail-value">${getServiceTypeName(booking.serviceType)}</span></div>
                <div class="detail-row"><span class="detail-label">Date:</span><span class="detail-value">${formatDate(booking.preferredDate)}</span></div>
                <div class="detail-row"><span class="detail-label">Time:</span><span class="detail-value">${formatTime(booking.preferredTime)}</span></div>
                <div class="detail-row"><span class="detail-label">Status:</span><span class="detail-value">${booking.bookingStatus}</span></div>
            </div>
        </div>
        <div class="work-description">
            <div class="detail-title">Service Work Description</div>
            <div style="font-size: 11px;">${billData.workDescription || `${getServiceTypeName(booking.serviceType)} service performed`}</div>
        </div>
        ${billData.parts && billData.parts.length > 0 ? `
        <div class="parts-section">
            <div class="detail-title">Parts Replaced / Consumables Used</div>
            <table class="parts-table">
                <thead><tr><th>Part Name</th><th>Qty</th><th>Unit Price (₹)</th><th>Total (₹)</th></tr></thead>
                <tbody>
                    ${billData.parts.map(part => `
                        <tr><td>${part.name || 'N/A'}</td><td>${part.quantity || 0}</td><td>₹${(part.unitPrice || 0).toFixed(2)}</td><td>₹${(part.total || 0).toFixed(2)}</td></tr>
                    `).join('')}
                </tbody>
                <tfoot><tr style="font-weight: 600;"><td colspan="3" style="text-align: right;">Parts Total:</td><td>₹${totals.partsTotal.toFixed(2)}</td></tr></tfoot>
            </table>
        </div>` : ''}
        <div class="charges-section">
            <div class="charges-box">
                <div class="detail-title">Service Charges</div>
                <div class="detail-row"><span class="detail-label">Service Charges:</span><span class="detail-value">₹${billData.serviceCharges.toFixed(2)}</span></div>
                <div class="detail-row"><span class="detail-label">Labor Charges:</span><span class="detail-value">₹${billData.laborCharges.toFixed(2)}</span></div>
                <div class="detail-row"><span class="detail-label">Additional Charges:</span><span class="detail-value">₹${billData.additionalCharges.toFixed(2)}</span></div>
            </div>
            <div class="charges-box">
                <div class="detail-title">Additional Services</div>
                ${billData.waterWash ? `<div class="detail-row"><span class="detail-label">Vehicle Wash & Clean:</span><span class="detail-value">₹${billData.waterWashCharges.toFixed(2)}</span></div>` : ''}
                <div class="detail-row"><span class="detail-label">Discount (${billData.discount}%):</span><span class="detail-value" style="color: #dc2626;">-₹${totals.discountAmount.toFixed(2)}</span></div>
                <div class="detail-row"><span class="detail-label">Payment Status:</span><span class="detail-value">${billData.paymentStatus}</span></div>
            </div>
        </div>
        <div class="bill-summary">
            <div class="summary-title">BILL SUMMARY</div>
            <div class="summary-grid">
                <div>
                    <div class="summary-row"><span>Service Charges:</span><span>₹${billData.serviceCharges.toFixed(2)}</span></div>
                    <div class="summary-row"><span>Labor Charges:</span><span>₹${billData.laborCharges.toFixed(2)}</span></div>
                    <div class="summary-row"><span>Parts & Consumables:</span><span>₹${totals.partsTotal.toFixed(2)}</span></div>
                </div>
                <div>
                    <div class="summary-row"><span>Additional Charges:</span><span>₹${billData.additionalCharges.toFixed(2)}</span></div>
                    ${billData.waterWash ? `<div class="summary-row"><span>Vehicle Wash:</span><span>₹${totals.waterWashTotal.toFixed(2)}</span></div>` : ''}
                    <div class="summary-row"><span>Subtotal:</span><span>₹${totals.subtotal.toFixed(2)}</span></div>
                </div>
            </div>
            ${billData.discount > 0 ? `<div class="summary-row" style="color: #dc2626; margin-top: 8px;"><span>Discount (${billData.discount}%):</span><span>-₹${totals.discountAmount.toFixed(2)}</span></div>` : ''}
            <div class="total-row"><span>TOTAL AMOUNT:</span><span class="total-amount">₹${totals.total.toFixed(2)}</span></div>
            <div style="text-align: center; margin-top: 8px; font-size: 10px; color: #4b5563;">
                Amount in words: <span style="font-weight: 500; text-transform: capitalize;">Rupees ${Math.floor(totals.total)} and ${Math.round((totals.total % 1) * 100)} Paise Only</span>
            </div>
        </div>
        ${billData.notes ? `<div style="border: 1px solid #d1d5db; border-radius: 8px; padding: 12px; margin: 16px 0;"><div class="detail-title">Additional Notes / Comments</div><div style="font-size: 11px;">${billData.notes}</div></div>` : ''}
        <div class="terms-section">
            <div class="terms-title">TERMS & CONDITIONS</div>
            <div class="terms-grid">
                <div><div class="terms-category">Service Warranty:</div><div class="terms-list">• All services guaranteed for 30 days or 1000 km, whichever comes first<br>• Parts warranty as per manufacturer's terms<br>• Free re-service if issue persists within warranty period</div></div>
                <div><div class="terms-category">Payment & Delivery:</div><div class="terms-list">• Payment due upon completion of service<br>• Vehicle will be released only after full payment<br>• Additional charges may apply for extra work requested</div></div>
                <div><div class="terms-category">Liability:</div><div class="terms-list">• Company not responsible for items left in vehicle<br>• Customer advised to remove valuables before service<br>• Vehicle parked at owner's risk</div></div>
                <div><div class="terms-category">General:</div><div class="terms-list">• All disputes subject to local jurisdiction only<br>• Service advisor contact for any queries<br>• Regular service recommended for optimal performance</div></div>
            </div>
        </div>
        <div class="certificate">
            <div class="certificate-title">SERVICE COMPLETION CERTIFICATE</div>
            <div class="certificate-text">This is to certify that the above mentioned vehicle has been serviced as per the customer's requirement and is ready for delivery in good condition.</div>
        </div>
        <div class="footer">
            <div class="footer-title">Thank You for Choosing Venkateswara Motors!</div>
            <div class="footer-text">Your satisfaction is our priority. For any service-related queries, please contact us at +91-9876543210 or visit our service center.</div>
            <div class="footer-text" style="font-weight: 500;">Next Service Due: ${(() => { const nextDate = new Date(booking.preferredDate); nextDate.setMonth(nextDate.getMonth() + 6); return nextDate.toLocaleDateString('en-IN'); })()} | Follow us on social media for service reminders</div>
        </div>
    </div>
</body>
</html>`;
    };

    // Get service type name
    const getServiceTypeName = (serviceTypeId) => {
        const serviceType = serviceTypes.find(service => service.id === serviceTypeId);
        return serviceType ? serviceType.name : serviceTypeId;
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Format time for display
    const formatTime = (timeString) => {
        return timeString; // Already in HH:mm AM/PM format
    };

    if (!isOpen || !booking) return null;

    return (
        <>
            <style jsx>{`
        @media print {
          .fixed {
            position: static !important;
          }
          .bg-black {
            background: transparent !important;
          }
          .max-w-3xl {
            max-width: none !important;
          }
          .rounded-lg {
            border-radius: 0 !important;
          }
          .shadow-xl {
            box-shadow: none !important;
          }
        }
      `}</style>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[95vh] sm:max-h-[85vh] overflow-y-auto print:shadow-none print:max-h-none print:overflow-visible print:max-w-none print:w-auto">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 print:hidden">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${mode === 'edit'
                                ? 'bg-blue-100'
                                : 'bg-green-100'
                                }`}>
                                <FileText className={`h-3 w-3 sm:h-4 sm:w-4 ${mode === 'edit'
                                    ? 'text-blue-600'
                                    : 'text-green-600'
                                    }`} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                    {mode === 'edit' ? 'Edit Bill' : 'Generate Bill'}
                                </h3>
                                <p className="text-xs text-gray-500 truncate">
                                    Booking ID: {booking.bookingId}
                                    {mode === 'edit' && existingBill && (
                                        <span className="ml-2 text-blue-600">
                                            • Bill #{existingBill.billNumber}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            className="h-8 w-8 p-0 border-gray-300 flex-shrink-0 ml-2"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Bill Content */}
                    <div className="relative p-3 sm:p-4 space-y-3 sm:space-y-4">
                        {/* Loading Overlay */}
                        {loadingBill && (
                            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
                                <div className="text-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">Loading existing bill data...</p>
                                </div>
                            </div>
                        )}
                        {/* Company Header */}
                        <div className="border-b-2 border-blue-200 pb-3 sm:pb-4">
                            <div className="text-center mb-2 sm:mb-3">
                                <h1 className="text-lg sm:text-2xl font-bold text-blue-700">VENKATESWARA MOTORS</h1>
                                <p className="text-sm sm:text-base text-gray-700 font-medium">Professional Vehicle Service Center</p>
                                <div className="text-xs text-gray-600 mt-1">
                                    <p>Address: 4WF6+9QG, SH 57, Ma. Po. Si. Nagar, Kakkalur, Tamil Nadu 602001</p>
                                    <p>Phone: +91-9677464451 | Email: venkateshwaramotors.trl@gmail.com</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-200">
                                <div className="text-left">
                                    <p className="text-sm font-bold text-gray-800">
                                        Bill No: VM-{new Date().getFullYear()}-{booking.bookingId.toString().padStart(4, '0')}
                                    </p>
                                    <p className="text-xs text-gray-600">Date: {new Date().toLocaleDateString('en-IN')}</p>
                                    <p className="text-xs text-gray-600">Time: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <div className="text-left sm:text-right mt-2 sm:mt-0">
                                    <h2 className="text-sm sm:text-lg font-bold text-gray-900 bg-blue-100 px-2 sm:px-3 py-1 rounded inline-block">SERVICE BILL</h2>
                                    <p className="text-xs text-green-600 font-medium mt-1">✓ Authorized Service Center</p>
                                </div>
                            </div>
                        </div>

                        {/* Customer & Service Details */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                            {/* Customer Details */}
                            <div className="border border-gray-200 rounded-lg p-3">
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Customer Details</h3>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Name:</span>
                                        <span className="font-medium">{booking.customerName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phone:</span>
                                        <span className="font-medium">{booking.contactNumber || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Vehicle:</span>
                                        <span className="font-medium">{booking.vehicleModel}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Reg. No:</span>
                                        <span className="font-medium">{booking.vehicleRegNo}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Service Details */}
                            <div className="border border-gray-200 rounded-lg p-3">
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Service Details</h3>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Service:</span>
                                        <span className="font-medium">{getServiceTypeName(booking.serviceType)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Date:</span>
                                        <span className="font-medium">{formatDate(booking.preferredDate)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Time:</span>
                                        <span className="font-medium">{formatTime(booking.preferredTime)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className="font-medium">{booking.bookingStatus}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Work Description */}
                        <div className="border border-gray-300 rounded-lg p-3 bg-blue-50">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center">
                                <Wrench className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-blue-600 flex-shrink-0" />
                                <span className="truncate">Service Work Description</span>
                            </h3>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Work Performed</label>
                                <textarea
                                    value={billData.workDescription}
                                    onChange={(e) => setBillData(prev => ({ ...prev, workDescription: e.target.value }))}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    rows="3"
                                    placeholder="Describe the work performed..."
                                />
                            </div>
                        </div>

                        {/* Parts Replaced Section */}
                        <div className="border border-gray-300 rounded-lg p-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                                    <Wrench className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-orange-600 flex-shrink-0" />
                                    <span className="truncate">Parts Replaced / Consumables Used</span>
                                </h3>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={addPart}
                                    className="bg-green-600 hover:bg-green-700 text-white h-6 px-2 text-xs sm:text-sm self-start sm:self-auto"
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Part
                                </Button>
                            </div>

                            {billData.parts.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-[600px] w-full text-xs">
                                        <thead>
                                            <tr className="text-gray-700 border-b">
                                                <th className="text-left font-medium pb-1 pr-2">Part Name</th>
                                                <th className="text-left font-medium pb-1 pr-2">Qty</th>
                                                <th className="text-left font-medium pb-1 pr-2">Unit Price (₹)</th>
                                                <th className="text-left font-medium pb-1 pr-2">Total (₹)</th>
                                                <th className="text-left font-medium pb-1">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {billData.parts.map((part) => (
                                                <tr key={part.id} className="align-middle">
                                                    <td className="py-1 pr-2">
                                                        <input
                                                            type="text"
                                                            value={part.name}
                                                            onChange={(e) => updatePart(part.id, 'name', e.target.value)}
                                                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="Part name"
                                                        />
                                                    </td>
                                                    <td className="py-1 pr-2">
                                                        <input
                                                            type="number"
                                                            value={part.quantity || ''}
                                                            onChange={(e) => {
                                                                const cleanValue = e.target.value.replace(/^0+/, '') || '0';
                                                                const numericValue = cleanValue === '' ? 0 : parseFloat(cleanValue) || 0;
                                                                updatePart(part.id, 'quantity', numericValue);
                                                            }}
                                                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                            min="0"
                                                            step="1"
                                                        />
                                                    </td>
                                                    <td className="py-1 pr-2">
                                                        <input
                                                            type="number"
                                                            value={part.unitPrice || ''}
                                                            onChange={(e) => {
                                                                const cleanValue = e.target.value.replace(/^0+/, '') || '0';
                                                                const numericValue = cleanValue === '' ? 0 : parseFloat(cleanValue) || 0;
                                                                updatePart(part.id, 'unitPrice', numericValue);
                                                            }}
                                                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </td>
                                                    <td className="py-1 pr-2">
                                                        <span className="text-xs font-medium">₹{part.total.toFixed(2)}</span>
                                                    </td>
                                                    <td className="py-1">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => removePart(part.id)}
                                                            className="h-6 w-6 p-0 border-red-300 text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td className="pt-2 text-right font-semibold" colSpan={4}>Parts Total:</td>
                                                <td className="pt-2 font-semibold">₹{calculatePartsTotal().toFixed(2)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 text-center py-4">No parts added. Click "Add Part" to add parts.</p>
                            )}
                        </div>

                        {/* Service Charges & Additional Services */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                            {/* Service Charges */}
                            <div className="border border-gray-300 rounded-lg p-3">
                                <h3 className="text-sm font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center">
                                    <Calculator className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-blue-600 flex-shrink-0" />
                                    <span className="truncate">Service Charges</span>
                                </h3>
                                <div className="space-y-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Service Charges (₹)</label>
                                        <input
                                            type="number"
                                            value={billData.serviceCharges || ''}
                                            onChange={(e) => handleNumberInputChange('serviceCharges', e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Labor Charges (₹)</label>
                                        <input
                                            type="number"
                                            value={billData.laborCharges || ''}
                                            onChange={(e) => handleNumberInputChange('laborCharges', e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Additional Charges (₹)</label>
                                        <input
                                            type="number"
                                            value={billData.additionalCharges || ''}
                                            onChange={(e) => handleNumberInputChange('additionalCharges', e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Services */}
                            <div className="border border-gray-300 rounded-lg p-3">
                                <h3 className="text-sm font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center">
                                    <Droplets className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-blue-600 flex-shrink-0" />
                                    <span className="truncate">Additional Services</span>
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 bg-blue-50 rounded">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={billData.waterWash}
                                                onChange={(e) => setBillData(prev => ({ ...prev, waterWash: e.target.checked }))}
                                                className="mr-2 flex-shrink-0"
                                            />
                                            <span className="text-sm font-medium">Vehicle Wash & Clean</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs">₹</span>
                                            <input
                                                type="number"
                                                value={billData.waterWashCharges || ''}
                                                onChange={(e) => handleNumberInputChange('waterWashCharges', e.target.value)}
                                                className="w-16 px-1 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                min="0"
                                                step="1"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Discount (%)</label>
                                        <input
                                            type="number"
                                            value={billData.discount || ''}
                                            onChange={(e) => handleNumberInputChange('discount', e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Payment Status</label>
                                        <select
                                            value={billData.paymentStatus}
                                            onChange={(e) => setBillData(prev => ({ ...prev, paymentStatus: e.target.value }))}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="PAID">Fully Paid</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional Bill Summary */}
                        <div className="border-2 border-green-200 rounded-lg p-3 sm:p-4 bg-green-50">
                            <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-3 text-center">BILL SUMMARY</h3>
                            {(() => {
                                const totals = calculateBillTotals();
                                return (
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                                            <div className="space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Service Charges:</span>
                                                    <span>₹{billData.serviceCharges.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Labor Charges:</span>
                                                    <span>₹{billData.laborCharges.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Parts & Consumables:</span>
                                                    <span>₹{totals.partsTotal.toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Additional Charges:</span>
                                                    <span>₹{billData.additionalCharges.toFixed(2)}</span>
                                                </div>
                                                {billData.waterWash && (
                                                    <div className="flex justify-between">
                                                        <span>Vehicle Wash:</span>
                                                        <span>₹{totals.waterWashTotal.toFixed(2)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <Separator className="my-2" />

                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between font-medium">
                                                <span>Subtotal:</span>
                                                <span>₹{totals.subtotal.toFixed(2)}</span>
                                            </div>
                                            {billData.discount > 0 && (
                                                <div className="flex justify-between text-red-600">
                                                    <span>Discount ({billData.discount}%):</span>
                                                    <span>-₹{totals.discountAmount.toFixed(2)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <Separator className="my-3" />

                                        <div className="flex justify-between text-base sm:text-lg font-bold bg-white p-2 sm:p-3 rounded border">
                                            <span>TOTAL AMOUNT:</span>
                                            <span className="text-green-700">₹{totals.total.toFixed(2)}</span>
                                        </div>

                                        <div className="text-center mt-2">
                                            <p className="text-xs text-gray-600">
                                                Amount in words: <span className="font-medium capitalize">
                                                    {/* You can add a number-to-words converter here */}
                                                    Rupees {Math.floor(totals.total)} and {Math.round((totals.total % 1) * 100)} Paise Only
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Notes Section */}
                        {/* <div className="border border-gray-300 rounded-lg p-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes / Comments</label>
                            <textarea
                                value={billData.notes}
                                onChange={(e) => setBillData(prev => ({ ...prev, notes: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                rows="3"
                                placeholder="Add any warranty information, special instructions, or additional notes for the customer..."
                            />
                        </div> */}

                        {/* Professional Terms and Conditions */}
                        <div className="border border-gray-300 rounded-lg p-3 sm:p-4 bg-gray-50">
                            <h4 className="text-sm font-bold text-gray-900 mb-2 sm:mb-3 text-center">TERMS & CONDITIONS</h4>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs text-gray-700">
                                <div>
                                    <h5 className="font-semibold mb-1">Service Warranty:</h5>
                                    <ul className="space-y-0.5 ml-2">
                                        <li>• All services guaranteed for 30 days or 1000 km, whichever comes first</li>
                                        <li>• Parts warranty as per manufacturer's terms</li>
                                        <li>• Free re-service if issue persists within warranty period</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-semibold mb-1">Payment & Delivery:</h5>
                                    <ul className="space-y-0.5 ml-2">
                                        <li>• Payment due upon completion of service</li>
                                        <li>• Vehicle will be released only after full payment</li>
                                        <li>• Additional charges may apply for extra work requested</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-semibold mb-1">Liability:</h5>
                                    <ul className="space-y-0.5 ml-2">
                                        <li>• Company not responsible for items left in vehicle</li>
                                        <li>• Customer advised to remove valuables before service</li>
                                        <li>• Vehicle parked at owner's risk</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-semibold mb-1">General:</h5>
                                    <ul className="space-y-0.5 ml-2">
                                        <li>• All disputes subject to local jurisdiction only</li>
                                        <li>• Service advisor contact for any queries</li>
                                        <li>• Regular service recommended for optimal performance</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Professional Footer - Print Optimized */}
                        <div className="mt-4 sm:mt-6 print:mt-8">
                            {/* Service Completion Certificate */}
                            <div className="border-2 border-blue-300 rounded-lg p-2 sm:p-3 bg-blue-50 text-center">
                                <h4 className="text-xs sm:text-sm font-bold text-blue-800 mb-1">SERVICE COMPLETION CERTIFICATE</h4>
                                <p className="text-xs text-blue-700">
                                    This is to certify that the above mentioned vehicle has been serviced as per the
                                    customer's requirement and is ready for delivery in good condition.
                                </p>
                            </div>


                            {/* Professional Footer */}
                            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t-2 border-gray-300 text-center print:mt-8">
                                <div className="bg-blue-700 text-white p-2 sm:p-3 rounded-lg print:bg-gray-800">
                                    <h4 className="text-sm sm:text-base font-bold mb-1">Thank You for Choosing Venkateswara Motors!</h4>
                                    {/* <p className="text-xs">
                                        Your satisfaction is our priority. For any service-related queries,
                                        please contact us at +91-9876543210 or visit our service center.
                                    </p>
                                    <p className="text-xs mt-1 font-medium">
                                        Next Service Due: {(() => {
                                            const nextDate = new Date(booking.preferredDate);
                                            nextDate.setMonth(nextDate.getMonth() + 3);
                                            return nextDate.toLocaleDateString('en-IN');
                                        })()} | Follow us on social media for service reminders
                                    </p> */}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-0 sm:space-x-2 p-3 border-t border-gray-200 bg-gray-50 print:hidden">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            className="border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePdfDownload}
                            disabled={isGeneratingPdf}
                            className="border-purple-300 text-purple-700 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGeneratingPdf ? (
                                <>
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Download className="h-3 w-3 mr-1" />
                                    PDF
                                </>
                            )}
                        </Button>
                        {mode === 'edit' && existingBill && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowShareModal(true)}
                                disabled={!existingBill || isSharingBill}
                                className="border-blue-300 text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Share2 className="h-3 w-3 mr-1" />
                                Share
                            </Button>
                        )}
                        <Button
                            size="sm"
                            onClick={handleBillSave}
                            disabled={isSaving || loadingBill}
                            className={`text-white disabled:opacity-50 disabled:cursor-not-allowed ${mode === 'edit'
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-green-600 hover:bg-green-700'
                                }`}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    {mode === 'edit' ? 'Updating...' : 'Saving...'}
                                </>
                            ) : (
                                <>
                                    <Save className="h-3 w-3 mr-1" />
                                    {mode === 'edit' ? 'Update Bill' : 'Save Bill'}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Share Bill Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        {/* Share Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Mail className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Share Bill via Email</h3>
                                    <p className="text-xs text-gray-500">
                                        Bill #{existingBill?.billNumber || 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleShareModalClose}
                                className="h-8 w-8 p-0 border-gray-300"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Share Modal Content */}
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={shareEmail}
                                    onChange={(e) => setShareEmail(e.target.value)}
                                    placeholder="Enter customer's email address"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    autoFocus
                                />
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg">
                                <h4 className="text-sm font-medium text-blue-900 mb-2">Bill Details to be Shared:</h4>
                                <div className="text-xs text-blue-700 space-y-1">
                                    <p><span className="font-medium">Customer:</span> {booking?.customerName}</p>
                                    <p><span className="font-medium">Vehicle:</span> {booking?.vehicleModel} ({booking?.vehicleRegNo})</p>
                                    <p><span className="font-medium">Service:</span> {getServiceTypeName(booking?.serviceType)}</p>
                                    <p><span className="font-medium">Bill Number:</span> {existingBill?.billNumber}</p>
                                </div>
                            </div>

                            <div className="text-xs text-gray-500">
                                <p>The bill will be sent as a PDF attachment to the specified email address.</p>
                            </div>
                        </div>

                        {/* Share Modal Footer */}
                        <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-200 bg-gray-50">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleShareModalClose}
                                disabled={isSharingBill}
                                className="border-gray-300 text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleShareBill}
                                disabled={isSharingBill || !shareEmail.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSharingBill ? (
                                    <>
                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-3 w-3 mr-1" />
                                        Send Bill
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BillGenerationModal;