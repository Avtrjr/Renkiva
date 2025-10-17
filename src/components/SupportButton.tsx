import { Coffee, Heart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SUPPORT_LINKS = [
  {
    name: "GitHub Sponsors",
    url: "https://github.com/sponsors",
    icon: Heart,
  },
  {
    name: "Ko-fi",
    url: "https://ko-fi.com",
    icon: Coffee,
  },
  {
    name: "Buy Me a Coffee",
    url: "https://buymeacoffee.com",
    icon: Coffee,
  },
];

export function SupportButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 rounded-2xl">
          <Coffee className="h-4 w-4" />
          Support Us
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-background/95 backdrop-blur-xl border-border/50 z-50" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Support Development</p>
            <p className="text-xs leading-none text-muted-foreground">
              Help us stay independent & ad-free
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {SUPPORT_LINKS.map((link) => (
            <DropdownMenuItem key={link.name} asChild>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 cursor-pointer"
              >
                <link.icon className="h-4 w-4" />
                <span>{link.name}</span>
                <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
              </a>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="px-2 py-2">
          <p className="text-xs text-muted-foreground">
            Renkiva is ad-free and powered by our community. Your support helps us build a better platform.
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
