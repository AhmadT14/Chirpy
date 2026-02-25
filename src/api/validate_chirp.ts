  import { BadRequestError } from "./errors.js";

type Chirp = {
  body: string;
  userId:string
};
export async function handlerChirpsValidate(chirp:Chirp) {
  if (chirp.body.length > 140) {
   throw new BadRequestError("Chirp is too long. Max length is 140") 
  }
  const keyWords = ["kerfuffle", "sharbert", "fornax"];
  const words = chirp.body.split(" ");
  for (let i = 0; i < words.length; i++) {
    if (keyWords.includes(words[i].toLowerCase())) {
      words[i] = "****";
    }
  }
  chirp.body=words.join(" ")
}
