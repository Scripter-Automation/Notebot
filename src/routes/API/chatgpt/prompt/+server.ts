import FirebaseAdminService from "$lib/Services/Server/FirebaseAdminService";
import FirebaseService from "$lib/Services/Client/FirebaseService";
import OpenAIService from "$lib/Services/Server/OpenAIService";
import QdrantService from "$lib/Services/Server/QdrantService";
import type { RequestHandler } from "@sveltejs/kit";

type contextMessage = {
    score:number,
    user_prompt:string,
    response:string
}

export const POST: RequestHandler = async ({ request, cookies }) => {

    const data = await request.json();
    console.log(data);
    const openai = new OpenAIService();
    const firebase = await FirebaseAdminService.getInstance();
    const rag = new QdrantService(firebase.get_uid(await firebase.getUser(cookies.get("email"))));
    const embeding = await openai.generate_embeding(data.prompt);

    const query = await rag.get_context(data.context, embeding);
    let payload:string= "Sin contexto encontrado, contesta como lo harias normalmente";
    console.log("query", query);

    if(query?.points){
        if(query.points.length > 0){
            const temp_payload:contextMessage[]=[];
            query.points.forEach((point)=>{
                console.log(point.payload)
                const contextMessage:contextMessage = {
                    score:point.score,
                    user_prompt:point.payload?.prompt as string,
                    response:point.payload?.response as string
                }
                temp_payload.push(contextMessage);
                payload = JSON.stringify(temp_payload)
            })
        }
    }

    console.log("payload",payload)
    const context = `
        ${data.prompt}
    `
    console.log("context", context);
    const res = await openai.chat([
        {role:"system", content:"You are an assistant focused on producing answers for the user. Memory will be managed externally via a vectorDB. You will receive relevant context when needed and should assume you have this memory. Never say you cannot remember things or store data; instead, answer using the provided context or say you will remember the information for future reference."},
        {role:"system", content:"Your answer is going to be rendered using the following markdown library, please use it to format your answers https://www.npmjs.com/package/@humanspeak/svelte-markdown"},
        {role:"user", content:context}
    ]);
    console.log(res);

    return new Response(JSON.stringify({res, embeding}), {
        status: 200,
        headers: {
            'Content-Type': 'text/plain'
        }
    });

};

