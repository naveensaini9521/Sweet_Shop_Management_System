import { useEffect, useState } from "react";
import api from "../api/api";

export default function Dashboard() {
  const [sweets, setSweets] = useState([]);

  useEffect(() => {
    api.get("/sweets").then(res => setSweets(res.data));
  }, []);

  return (
    <div>
      <h2>Sweets</h2>
      {sweets.map(s => (
        <div key={s.id}>
          {s.name} - ₹{s.price} (Stock: {s.quantity})
        </div>
      ))}
    </div>
  );
}
