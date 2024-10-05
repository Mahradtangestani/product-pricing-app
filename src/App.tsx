import React from 'react';

import './App.css';
import { useQuery } from 'react-query';


const fetchProducts = async ()=>{
   const res = await fetch("https://dummyjson.com/c/1c70-7ac1-4234-b47d")
   return res.json()
}

const App:React.FC = ()=> {
   
  const {data , error , isLoading} = useQuery("products" , fetchProducts) 
  if(isLoading) return <div>Loading...</div>
  if(error) return <div>Error fetching data</div>

  return (
    <div>
      <h1>Product Pricing</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default App;
