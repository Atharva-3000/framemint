/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { uploadImageToIPFS } from "@/lib/filebase";

interface GenerateImageResponse {
  nftIpfsUrl: string;
  img: string;
}
export const generateImage = async (
    base64String: string
  ): Promise<GenerateImageResponse | null> => {
    try {
      // Convert base64 to buffer on the server
      const imageBuffer = Buffer.from(base64String, "base64");
  
      // Upload image to IPFS
      const ipfsUrl = await uploadImageToIPFS(imageBuffer);
      if (!ipfsUrl) {
        console.error("Error: Image upload to IPFS failed.");
        return null;
      }
  
      // NFT metadata
      const nftMetadata = {
        name: "MONAD BLITZ BANGALORE",
        image: ipfsUrl,
        attributes: [
          {
            trait_type: "Status",
            value: "FUN MINTED ON MONAD",
          },
        ],
      };
  
      const nftObjBuffer = Buffer.from(JSON.stringify(nftMetadata));
      const nftIpfsUrl = await uploadImageToIPFS(nftObjBuffer);
      if (!nftIpfsUrl) {
        console.error("Error: NFT metadata upload to IPFS failed.");
        return null;
      }
  
      return {
        nftIpfsUrl,
        img: ipfsUrl,
      };
    } catch (error: any) {
      console.error(
        "Error generating image:",
        error.response?.data || error.message
      );
      throw new Error("Failed to generate image. Please try again later.");
    }
  };
  
