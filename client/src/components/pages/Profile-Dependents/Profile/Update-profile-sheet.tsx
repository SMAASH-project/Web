import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Username = "placeholder";
const Email = "lorem@ipsum.com";
const Password = "password";

export function UpdateSheet() {
  return (
    <div className="z-101">
      <Sheet>
        <SheetTrigger asChild>
          <Button className="text-white">Edit</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            <div className="grid gap-3">
              <Label htmlFor="sheet-name">Username</Label>
              <Input id="sheet-name" defaultValue={Username} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="sheet-email">Email Adress</Label>
              <Input id="sheet-email" defaultValue={Email} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="sheet-username">Password</Label>
              <Input id="sheet-username" defaultValue={Password} />
            </div>
          </div>
          <SheetFooter>
            <Button type="submit" className="text-white">
              Save changes
            </Button>
            <SheetClose asChild>
              <Button className="text-white">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
