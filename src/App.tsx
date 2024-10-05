import React, { useState } from 'react';

import './App.css';
import { useQuery } from 'react-query';


const fetchProducts = async ()=>{
   const res = await fetch("https://dummyjson.com/c/1c70-7ac1-4234-b47d")
   return res.json()
}

const App:React.FC = ()=> {
   
  const {data , error , isLoading} = useQuery("products" , fetchProducts) 
  const [selectedItems, setSelectedItems] = useState<number[]>([]); // نگهداری آیتم‌های انتخاب شده

  if(isLoading) return <div>Loading...</div>
  if(error) return <div>Error fetching data</div>

  console.log(data);
  
  
  const totalPrice = data.providersPriceDetails
  .filter((item:any)=> selectedItems.includes(item.id))
  .reduce((sum: number, item: any) => sum + item.unit * item.quantity, 0);


    // مدیریت انتخاب چک‌باکس‌ها
    const handleCheckboxChange = (id: number) => {
      if (selectedItems.includes(id)) {
        // اگر آیتم از قبل انتخاب شده بود، آن را حذف کنیم
        setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
      } else {
        // اگر آیتم انتخاب نشده بود، آن را اضافه کنیم
        setSelectedItems([...selectedItems, id]);
      }
    };

  return (
    <div className='container mx-auto p-4'>
       <h1 className='text-center text-2xl font-bold mb-4'>Product Pricing</h1>
       {/* نمایش مجموع قیمت */}
      <div className="text-right mb-4">
        <strong>Total Price: </strong>{totalPrice}
      </div>
       <table className="min-w-full bg-white">
           <thead className='bg-slate-700 text-white'>
               <tr>
                   <th className="py-2">Product</th>
                   <th className="py-2">Sub Item</th>
                   <th className="py-2">Price</th>
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
    </div>
  );
}

export default App;
