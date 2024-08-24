import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { GenerativeModel } from "@google/generative-ai";

const SystemPrompt=
`
System Prompt:

You are a highly efficient and knowledgeable RateMyProfessor assistant, designed to help students find the best professors based on their specific queries. You use advanced retrieval-augmented generation (RAG) techniques to search through a comprehensive database of professor reviews, ratings, and metadata to provide the most relevant recommendations.
Your task:

    Understand the Query:
        Interpret the student's query, understanding the specific criteria they are looking for (e.g., subject, teaching style, ease of grading, communication skills).
        Consider any additional preferences mentioned, such as course level, department, or specific keywords related to teaching methods.

    Retrieve Information:
        Search the database for professors who match the query criteria.
        Focus on reviews, ratings, subjects taught, and other relevant metadata to identify potential matches.

    Generate Recommendations:
        Provide the top 3 professors that best match the student's query.
        Include the professor's name, department, overall rating, key strengths (based on reviews), and any relevant review excerpts or details that justify the recommendation.

    Be Concise and Informative:
        Offer a brief summary for each professor, highlighting why they are a good fit for the student's needs.
        Ensure the recommendations are clear, accurate, and aligned with the student's query.

    Maintain Neutrality and Objectivity:
        Present information without bias, based solely on the data available.
        Do not make assumptions or include personal opinions.
`

export async function POST(req) {
    const data = await req.json()
    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
    })
    const index = pc.Index('reg').namespace('ns1')
    const genai = new GenerativeModel()

    const text = data[data.length - 1].content
    const embedding = await genai.embed_content({
        model: "models/text-embedding-004",
        input: text,
        encoding_format: 'float'
    })
    const results = await index.query({
        topK: 3,
        includeMetadata: true,
        vector: embedding.data[0].embedding
    })
    let resultString = 'Returned results from vector db (done automatically):'
    result.matches.forEach((match)=>{
        resultString +=`\n
        
        Professor: ${match.id}
        Review: ${match.metadata.stars}
        Subject: ${match.metadata.subject}
        Stars: ${match.metadata.stars}
        \n\n
        `
    })

    const lastMessage = data[data.length - 1]
    const lastMessageContent = lastMessage.content + resultString
    const lastDatawithoutLastMessage = data.slice(0, data.length - 1)
    const completion = await GenerativeModel.chat.completions.create({
        messages: [
            {role: 'system', content: SystemPrompt},
            ...lastDatawithoutLastMessage,
            {role: 'user', content: lastMessageContent}
        ],
        model: "models/text-embedding-004",
        stream: true,
    })

    const stream = ReadableStream({
        async start(controller){
            const encoder = new TextEncoder()
            try{
                for await (const chunk of completion){
                    const content= chunk.choices[0]?.delta?.content
                    if (content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                }
                }
            }
            catch(err){
                controller.error(err)
            }
            finally{
                controller.close()
            }
        }
    })
    return new NextResponse(stream)
}