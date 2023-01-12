"use client"
import React, { useState } from "react";
import { ArrowLongLeftIcon, ArrowLongRightIcon, ArrowSmallLeftIcon, ArrowSmallRightIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { fromBase58 } from "../../util/base58";
import Link from "next/link";
import { Title } from "@components/title";

type Props = {
    compositeKey?: string
}
export const Client: React.FC<Props> = ({ compositeKey }) => {


    const dec = compositeKey ? new TextDecoder().decode(fromBase58(compositeKey)).split("_") : undefined
    const [id, setId] = useState(dec?.at(0))
    const [encodedKey, setEncodedKey] = useState(dec?.at(1) ?? "")

    const [text, setText] = useState("")
    const [loading, setLoading] = useState(false)
    const [remainingReads, setRemainingReads] = useState<number | null>(null)
    const [error, setError] = useState("")



    const onSubmit = async () => {
        try {
            setError("")
            setText("")
            setLoading(true)




            const res = await fetch(`/api/v1/load?id=${id}`).then(r => r.json()) as { iv: string, data: string, remainingReads: number | null }
            setRemainingReads(res.remainingReads)

            console.log(res)

            console.log(fromBase58(res.iv))

            const key = await crypto.subtle.importKey("jwk",
                {
                    kty: "oct",
                    k: encodedKey,
                    alg: "A128CBC",

                    ext: true
                }, { name: "AES-CBC", length: 128 }, false, ["encrypt", "decrypt"])

            console.log({ key })

            const decrypted = await crypto.subtle.decrypt(
                {
                    name: "AES-CBC",
                    iv: fromBase58(res.iv)
                },
                key,
                fromBase58(res.data)
            )
            console.log("XXXX")

            setText(new TextDecoder().decode(decrypted))

        } catch (e) {
            console.error(e)
            setError((e as Error).message)

        } finally {
            setLoading(false)
        }


    }


    return (
        <div className="container px-8 mx-auto mt-16 lg:mt-32 ">


            {text ? <div className="">
                {
                    remainingReads !== null ?
                        (
                            <div className="text-sm text-center text-zinc-600">
                                {
                                    remainingReads > 0
                                        ? <p >This document can be read <span className="text-zinc-100">{remainingReads}</span> more times.</p>
                                        : <p className="text-zinc-400">This was the last time this document could be read. It was deleted from storage.</p>
                                }
                            </div>
                        )
                        : null}
                <pre
                    className="px-4 py-3 mt-8 font-mono text-left bg-transparent border rounded border-zinc-600 focus:border-zinc-100/80 focus:ring-0 sm:text-sm text-zinc-100"
                >

                    {text}
                </pre>


            </div> :
                <form className="max-w-3xl mx-auto" onSubmit={(e) => {
                    e.preventDefault()
                    onSubmit()
                }}>
                    <Title>Decrypt a document</Title>


                    <div className="grid items-center justify-center w-full grid-cols-1 gap-8 mt-8 sm:grid-cols-2 ">
                        <div className="px-3 py-2 border rounded border-zinc-600 focus-within:border-zinc-100/80 focus-within:ring-0 ">
                            <label htmlFor="id" className="block text-xs font-medium text-zinc-100">
                                ID
                            </label>
                            <input
                                type="text"
                                name="id"
                                id="id"
                                className="w-full p-0 text-base bg-transparent border-0 appearance-none text-zinc-100 placeholder-zinc-500 focus:ring-0 sm:text-sm"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                            />
                        </div>
                        <div className="relative px-3 py-2 border rounded border-zinc-600 focus-within:border-zinc-100/80 focus-within:ring-0 ">
                            <label htmlFor="key" className="block text-xs font-medium text-zinc-100">
                                KEY
                            </label>
                            <input
                                type="text"
                                name="key"
                                id="key"
                                className="w-full p-0 text-base bg-transparent border-0 appearance-none text-zinc-100 placeholder-zinc-500 focus:ring-0 sm:text-sm"
                                value={encodedKey}
                                onChange={(e) => setEncodedKey(e.target.value)}
                            />

                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`mt-8 w-full h-12 inline-flex justify-center items-center  transition-all  rounded px-4 py-1.5 md:py-2 text-base font-semibold leading-7 text-zinc-800   bg-zinc-200 ring-1  duration-300  hover:text-black hover:drop-shadow-cta   hover:bg-white ${loading ? "animate-pulse" : ""}`}
                    >
                        <span>
                            {loading ? <Cog6ToothIcon className="w-5 h-5 animate-spin" /> : "Unseal"}

                        </span>

                    </button>


                    <div className="mt-8">
                        <ul className="space-y-2 text-xs text-zinc-500">
                            <li>
                                <p >
                                    Fill in the id and key you have received to decrypt the document
                                </p>
                            </li>

                        </ul>
                    </div>
                </form>

            }


        </div>
    )



}