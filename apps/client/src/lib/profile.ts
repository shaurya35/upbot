import { BACKEND_URL } from "@/configs/env";
import axios from "axios";

const getProfile = async () => {
    try{
        const response = await axios.post(`${BACKEND_URL}/api/v1/profile`, {}, {
            withCredentials: true,
        });

        if(response.status === 200){
            const data = response.data;
            return {profile: data.profile};
        }
    }catch(error){
        console.log("getProfile error:", error);
        return null;
    }
}

export { getProfile };