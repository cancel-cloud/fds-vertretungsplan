'use client';
import React from "react";
import { ModeToggle } from "@/components/ui/darkmode-toggle";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "lucide-react";

export default function HeadderComponent() {

    return (
        <header className="">
            <nav className="flex items-center justify-between flex-wrap bg-primary-foreground p-6">
                <div className="justify-start">
                    <a href="/" className="text-xl text-primary-background">FDS Vertretungsplan</a>
                </div>
                <div className="flex flex-row items-center place-items-end gap-5">

                    <a href="/impressum" className="text-primary-background">Impressum</a>
                    <a href="/datenschutz" className="text-primary-background">Datenschutz</a>

                    <ModeToggle />
                    <Avatar className="cursor-pointer">
                        <AvatarImage src="https://github.com/cancel-cloud.png" alt="@shadcn" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    
                </div>
            </nav>
        </header>
    );
}
