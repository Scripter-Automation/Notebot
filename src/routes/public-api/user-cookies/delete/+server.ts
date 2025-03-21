import FirebaseAdminService from "$lib/Services/Server/FirebaseAdminService";
import { redirect, type RequestHandler } from "@sveltejs/kit";


export const DELETE: RequestHandler = async ({request, cookies})=>{
    const firebase =  await FirebaseAdminService.getInstance();
    const token = cookies.get("token")
    cookies.delete("email",{
        path:"/"
    })
    cookies.delete("token",{
        path:"/"
    })

    throw redirect(303, "/")
}