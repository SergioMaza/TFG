import { useContext } from "react";
import { AppContext } from "../components/app/AppContext";

export const useAppProvider = () => useContext(AppContext);