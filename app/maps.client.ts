import type { Libraries } from "@react-google-maps/api";
import { useJsApiLoader } from "@react-google-maps/api";
import { useMatchesData } from "./utils";

const LIBRARIES: Libraries = ['places', 'maps'];

function isEnv(env: any): env is typeof process.env {
    return env && typeof env === "object" && typeof env.NODE_ENV === "string";
}

export const useMapsApiLoader = () => {
    const data = useMatchesData("root");
    if (!data || !isEnv(data.ENV)) {
        throw new Error("No env found in root loader");
    }
    return useJsApiLoader({
        googleMapsApiKey: data.ENV.MAPS_API_KEY,
        libraries: LIBRARIES
    });
};