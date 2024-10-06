import React, { useState } from 'react';
import { useQuery } from 'react-query';
import * as XLSX from 'xlsx'; // وارد کردن کتابخانه xlsx



const fetchProducts = async () => {
  const res = await fetch('https://dummyjson.com/c/1c70-7ac1-4234-b47d');
  return res.json();
};

const App: React.FC = () => {
  const { data, error, isLoading } = useQuery('products', fetchProducts);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [discounts, setDiscounts] = useState<{ [key: number]: number }>({});
  const [submitStatus, setSubmitStatus] = useState<string | null>(null); // وضعیت ارسال فرم
  const [isSubmitting, setIsSubmitting] = useState(false); // وضعیت ارسال درخواست (برای اسپینر)

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching data</div>;

   
  const selectedProducts = data.providersPriceDetails.filter((item: any) =>
    selectedItems.includes(item.id)
  );


  // محاسبه مجموع قیمت با اعمال تخفیف
  const totalPrice = selectedProducts.reduce((sum: number, item: any) => {
    const discount = discounts[item.id] || 0;
    const priceAfterDiscount = item.unit * item.quantity * ((100 - discount) / 100);
    return sum + priceAfterDiscount;
  }, 0);




  // مدیریت انتخاب چک‌باکس‌ها
  const handleCheckboxChange = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // مدیریت تغییرات درصد تخفیف
  const handleDiscountChange = (id: number, value: string) => {
    const discountValue = parseFloat(value) || 0;
    setDiscounts({ ...discounts, [id]: discountValue });
  };

  // ارسال فرم به API
  const handleSubmit = async () => {
    setIsSubmitting(true); // نمایش اسپینر هنگام شروع ارسال

    const selectedProducts = data.providersPriceDetails
      .filter((item: any) => selectedItems.includes(item.id))
      .map((item: any) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unit: item.unit,
        discount: discounts[item.id] || 0,
      }));

    try {
      const res = await fetch('https://dummyjson.com/c/f2dc-400e-4fc3-a343', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products: selectedProducts }),
      });

      if (res.ok) {
        setSubmitStatus('Success: Data submitted successfully!');
      } else {
        setSubmitStatus('Error: Failed to submit data.');
      }
    } catch (error) {
      setSubmitStatus('Error: Failed to submit data.');
    } finally {
      setIsSubmitting(false); // پس از اتمام درخواست، اسپینر را حذف می‌کنیم
    }
  };


   
  // تابع دانلود اکسل
  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      selectedProducts.map((item: any) => ({
        Title: item.title,
        'Part Number': item.partNumber,
        Unit: item.unit,
        Quantity: item.quantity,
        Discount: discounts[item.id] || 0,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, 'selected_products.xlsx');
  };



  return (
    <div className="container mx-auto p-4">
      <h1 className="text-center text-2xl font-bold mb-4">Product Pricing with Discount</h1>

      {/* نمایش مجموع قیمت */}
      <div className="text-right mb-4">
        <strong>Total Price: </strong>{totalPrice.toFixed(2)}
      </div>

      {/* جدول محصولات */}
      <table className="min-w-full bg-white">
        <thead className='bg-slate-200'>
          <tr>
            <th className="py-2">Title</th>
            <th className="py-2">Part Number</th>
            <th className="py-2">Unit</th>
            <th className="py-2">Quantity</th>
            <th className="py-2">Discount (%)</th>
            <th className="py-2">Select</th>
          </tr>
        </thead>
        <tbody>
          {data.providersPriceDetails.map((item: any) => (
            <tr key={item.id}>
              <td className="border px-4 py-2">{item.title}</td>
              <td className="border px-4 py-2">{item.partNumber}</td>
              <td className="border px-4 py-2">{item.unit}</td>
              <td className="border px-4 py-2">{item.quantity}</td>
              <td className="border px-4 py-2">
                <input
                  type="number"
                  className="border p-1"
                  placeholder="Discount"
                  value={discounts[item.id] || ""}
                  onChange={(e) => handleDiscountChange(item.id, e.target.value)}
                  disabled={!selectedItems.includes(item.id)}
                />
              </td>
              <td className="border px-4 py-2 text-center">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleCheckboxChange(item.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>


      {/* دکمه ارسال فرم */}
      <div className="text-right mt-4">
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded mx-2"
          disabled={isSubmitting} // دکمه در حین ارسال غیر فعال می‌شود
        >
          {isSubmitting ? (
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-current" />
            // نمایش اسپینر
          ) : (
            'Submit'
          )}
        </button>

        {/* دکمه دانلود اکسل */}
        <button
          onClick={handleDownloadExcel}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Download Excel
        </button>
      </div>


      {/* نمایش وضعیت ارسال */}
      {submitStatus && <div className="mt-4 text-center text-green-600 font-bold">{submitStatus}</div>}
    </div>
  );
};

export default App;
