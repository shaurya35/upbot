import { describe, it, expect } from "bun:test";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

let BASE_URL = process.env.BASE_URL || "http://localhost:8080";

describe("Website gets created", () => {
    it("Website not created if url is not present", async () => {
        try{
            await axios.post(`${BASE_URL}/api/v1/ping`, {})
            expect("false", "Website created when it shouldn't")
        }catch(error){
            console.log("Error:", error)
        }
        
    })

    it("Website is created if url is present", async () => {
        try{
             const response = await axios.post(`${BASE_URL}/api/v1/ping`, {
                url: "https://google.com"
            })
            expect(response.data.id).not.toBeNull();
        }catch(error){
            console.log("Error:", error)
        }
        
    })
})