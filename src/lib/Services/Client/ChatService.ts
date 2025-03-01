
import type { Context, Message, Note,  Notebook, NotebookInstance, NoteInstance, Section, SectionInstance } from "../../../app";
import {v4 as uuidv4} from 'uuid';
import StorageService, { TimeFrame } from "./StorageService";


export enum ChatState{
    Entire_context=0,
    Notebook_context=1,
    Section_context=2,
    Note_context=3,
    User_answer=4
}



export default class Chat{
    private fetch: typeof fetch;
    private messages:Message[];
    private state:ChatState=ChatState.Entire_context;
    private storage_service = new StorageService();




    public notebooks:NotebookInstance[]=[];
    public sections:{[key: string]: SectionInstance[]} = {};
    public notes:{[key:string]:NoteInstance[]} = {};
    public recorded_messages:{[key:string]:Message[]} = {};
    private action?:(...params:any[])=>void;
    private update_function:(messages:Message[])=>void;
    private update_context:(context:{notebook:string, section:string, note:string})=>void;




    constructor(messages:Message[]=[],
         update_function:(messages:Message[])=>void,
         update_context:(context:{notebook:string, section:string,note:string})=>void,
         customFetch: typeof fetch
        ){
        this.fetch = customFetch;
        this.update_context = update_context;
        this.update_function = update_function;
        
        if(messages.length == 0){
            this.messages = [
            ]
        }else{
            this.messages = messages;
        }
    }



    public get_messages(){
        return this.messages;
    }

    public get_notebooks(){
        return this.notebooks;
    }

    public get_sections(){
        return this.sections;
    }

    public get_notes(){
        return this.notes;
    }

    public setUpdateFunction(func:(messages:Message[])=>void){
        this.update_function = func;
    }

    public async initialize_notes(){
        const notes = this.storage_service.get("notes");
        if(notes != null){
            this.notes = notes.notes as {[key:string]:NoteInstance[]};
        }else{
            const notesMap = await this.get_all_notes();
            this.notes = Object.fromEntries(notesMap) as { [key: string]: NoteInstance[] };
            this.storage_service.store("notes",{
                notes:this.notes,
                expiration: this.storage_service.createExpiration(TimeFrame.Day,1)
            });
        }
    }

    public async initialize_sections(){
        const sections = this.storage_service.get("sections");
        if(sections != null){
            this.sections = sections.sections as {[key:string]:SectionInstance[]};
        }else{
            const sectionsMap = await this.get_all_sections();
            this.sections = Object.fromEntries(sectionsMap) as { [key: string]: SectionInstance[] };
           
            this.storage_service.store("sections",{
                sections:this.sections,
                expiration: this.storage_service.createExpiration(TimeFrame.Day,1)
            });
        }
        
    }


    /**
     * This function causes 3 fetches which need to pass through the middleware 
     * it should be refactored to only use one fetch to achieve the same result
     */
    public async initialize_notebooks(){
        const notebooks = this.storage_service.get("notebooks");
        if(notebooks != null){
            this.notebooks = notebooks.notebooks as NotebookInstance[];
        }else{
            this.notebooks = await this.get_all_notebooks();
            this.storage_service.store("notebooks",{
                notebooks:this.notebooks,
                expiration: this.storage_service.createExpiration(TimeFrame.Day,1)
            });
        }

    }

    private async get_all_notebooks(){
        const res = await this.fetch("/api/qdrant/notebook/get_all",{
            method:"GET"
        })
        return await res.json();
    }

    private async get_all_sections(){
        const res = await this.fetch("/api/qdrant/section/get_all",{
            method:"POST",
        })
        return new Map(await res.json());
    }

    private async get_all_notes(){
        const res = await this.fetch("/api/qdrant/note/get_all",{
            method:"POST",
        })
        return new Map(await res.json());
    }
    /*
    private chat_create_notebook(){
        
        const messages=[{
            type:"normal",
            user_generated:false,
            text:"¿Cual es el nombre de tu cuaderno?, ¿Cual es el tema?, ¿Cual es la descripcion?"
        } as Message];


        this.set_state(ChatState.User_answer);
        this.set_action(this.create_notebook);
        this.update_function(messages);
    }*/
    /*
    private chat_select_notebook(){
            
        const options = this.notebooks.map((notebook:any)=>{
            return {text:notebook.title, func:()=>{
                this.context = {
                    notebook:notebook.id
                }
                this.public_context = {
                    ...this.public_context,
                    notebook: notebook.title
                };
                this.update_context(this.public_context);
                this.set_state(ChatState.Notebook_context);
                this.update_function([{
                    type:"menu",
                    text:"Cuaderno seleccionado, ahora puedes empezar a agregar secciones a este cuaderno",
                    options:[
                        {text:"Nueva seccion", func:this.chat_create_section.bind(this)},
         
                        {text:"Nueva nota", func: this.chat_create_note.bind(this)},
      
                    ]
                } as Message])
            }}
        })
        this.update_function([{
            type:"menu",
            text:"Selecciona un cuaderno de la lista",
            options:options
        } as Message])
    }
        */

    /*private async create_notebook(title:string,topic:string,description:string){
        const notebook_id = uuidv4();
        await this.fetch("/API/QDrant/notebook/create",{
            method:"POST",
            body:JSON.stringify({
                id: notebook_id,
                title:title,
                topic:topic,
                description:description
            })
        })
        this.set_state(ChatState.Notebook_context);

        this.update_context(this.public_context);
        this.create_section("General","General","This is the general section of the notebook",true);
        this.update_function([{
            type:"menu",
            text:"Cuaderno creado con exito, ahora puedes empezar a agregar secciones a este cuaderno",
            options:[
                {text:"Nueva seccion", func:this.chat_create_section.bind(this)},
                {text:"Nueva nota", func:this.chat_create_note.bind(this)}
            ]
        } as Message]);
    }*/

    /*private chat_create_section(){

        const messages=[{
            type:"normal",
            user_generated:false,
            text:"¿Cual es el nombre de la seccion?, ¿Cual es el tema?, ¿Cual es la descripcion? Usa una coma para separar las respuestas a estas preguntas"
        } as Message];

        this.set_state(ChatState.User_answer);
        this.set_action(this.create_section);
        this.update_function(messages);

    }*/

    

    /*private async create_section(title:string,topic:string, description:string, default_section:boolean=false){
        const section_id = uuidv4();
        await this.fetch("/API/QDrant/section/create",{
            method:"POST",
            body:JSON.stringify({
                id:section_id,
                topic:topic,
                notebook_id:this.context?.notebook,
                title:title,
                description:description,
                notebook:this.context?.notebook
            })
        })
        if(default_section){


            this.update_context(this.public_context);
            return;
        }else{
            this.set_state(ChatState.Section_context);
            this.update_function([{
                type:"menu",
                text:"Seccion creada con exito, ahora puedes empezar a agregar notas a esta seccion",
                options:[
                    {text:"Nueva nota", func:this.chat_create_note.bind(this)},
                ]
            } as Message]);
        }
    }*/

    /*private chat_create_note(){
        

        const messages=[{
            type:"normal",
            user_generated:false,
            text:"¿Cual seria el nombre de esta nota? No uses comas por favor."
        } as Message];

        this.update_function(messages);
        this.set_state(ChatState.User_answer);
        this.set_action(this.create_note);
    }
    */


    

    /*private async create_note(title:string){
        const note_id = uuidv4();
        await this.fetch("/API/QDrant/note/create",{
            method:"POST",
            body:JSON.stringify({
                id:note_id,
                title:title,
            })
        })

        this.set_action(this.add_message_to_note.bind(this));

        this.set_state(ChatState.Note_context);
        this.context = {
            ...this.context,
            note:note_id
        }
        this.update_function([{
            type:"normal",
            text:"Nota creada con exito, todo lo que hablemos ahora sera almacenado en esta nota"
        } as Message]);
    }*/
    /*
    private async add_message_to_note(user_prompt:string, response:string){
        await this.fetch("/API/QDrant/message/create",{
            method:"POST",
            body:JSON.stringify({
                id:uuidv4(),
                note_id:this.context?.note,
                notebookId:this.context?.notebook,
                sectionId:this.context?.section,
                prompt:user_prompt,
                response:response
            })
        })
    }
    */
    

    private async chat(prompt:string, context:Context){
        const res = await this.fetch("/api/chatgpt",{
            method:"POST",
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({
                prompt:prompt,
                context:context
            })
        })
        return await res.json();
    }

    private set_action(action:(...params:any[])=>void){
        this.action = action;
    }

    private set_state(state:ChatState){
        this.state = state;
    }

    public async respond(params:string, context:Context){
        this.update_function([{
            type:"normal",
            text:params,
            user_generated:true
        } as Message]);
 

        const res = await this.chat(params as string, context);
            console.log(res);
                this.update_function([{
                    type:"normal",
                    text:res,
                    user_generated:false
                } as Message])
  

    }


}