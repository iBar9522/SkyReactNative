import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet } from "react-native";

import { HeaderStock } from "./components/HeaderStock";
import { BalanceInput } from "./components/BalanceInput";
import { IdeaHeader } from "./components/IdeaHeader";
import { OrderTypeSelect } from "./components/OrderTypeSelect";
import { PriceInput } from './components/PriceInput';
import { QuantityInput } from "./components/QuantityInput";
import { ProgressSlider } from "./components/ProgressSlider";
import { DatePickerField } from "./components/DatePickerField";
import { Summary } from "./components/Summary";
import { Actions } from "./components/Actions";

export const Stock: React.FC = () => {
  const [amount, setAmount] = useState("");
  const [orderType, setOrderType] = useState("Не дороже");
  const [price, setPrice] = useState("130.07");
  const [quantity, setQuantity] = useState("2");
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());


  const handleAmountChange = (val: string) => setAmount(val.replace(/[^0-9.]/g, ""));
  const handlePriceChange = (val: string) => setPrice(val.replace(/[^0-9.]/g, ""));
  const handleQuantityChange = (val: string) => setQuantity(val.replace(/[^0-9]/g, ""));

  const increasePrice = () => setPrice((prev) => String((parseFloat(prev || "0") + 0.01).toFixed(2)));
  const decreasePrice = () => setPrice((prev) => String(Math.max(0, parseFloat(prev || "0") - 0.01).toFixed(2)));

  const increaseQuantity = () => setQuantity((prev) => String(parseInt(prev || "0") + 1));
  const decreaseQuantity = () =>
    setQuantity((prev) => {
      const current = parseInt(prev || "0");
      return String(Math.max(0, current - 1));
    });

  const totalSum = (parseFloat(price || "0") * parseInt(quantity || "0")).toFixed(2);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <HeaderStock onBack={() => {}} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BalanceInput value={amount} onChange={handleAmountChange} />
        <IdeaHeader />
        <OrderTypeSelect value={orderType} onChange={setOrderType} />
        <PriceInput value={price} onChange={handlePriceChange} increase={increasePrice} decrease={decreasePrice} />
        <QuantityInput value={quantity} onChange={handleQuantityChange} increase={increaseQuantity} decrease={decreaseQuantity} />
        <ProgressSlider value={progressPercentage} onChange={setProgressPercentage} />
        <DatePickerField value={selectedDate} onChange={setSelectedDate} />
        <Summary commission={20} total={totalSum} />
        <Actions />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0e1b36" },
  content: { padding: 16, paddingBottom: 24 },
});
