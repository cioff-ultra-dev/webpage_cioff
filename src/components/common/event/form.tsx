"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { createEvent } from "@/app/actions";
import { useFormState } from "react-dom";

export default function EventForm({ eventTypes }: { eventTypes: Array<any> }) {
  const [state, formAction] = useFormState(createEvent, undefined);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold">ADD AN EVENT</h1>
      <p className="text-sm text-muted-foreground">
        The fields with * are mandatory.
      </p>
      <form action={formAction}>
        <section className="mt-6">
          <h2 className="text-xl font-semibold">Basic Info</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input type="radio" name="state_mode" value="online" />
                <span>Online</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="state_mode"
                  value="offline"
                  defaultChecked
                />
                <span>Offline</span>
              </label>
            </div>
            <div>
              <Label className="mb-2" htmlFor="type">
                Type *
              </Label>
              <Select>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((item) => {
                    return (
                      <SelectItem key={item.slug} value={item.slug}>
                        {item.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" placeholder="Enter title" />
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter description"
              />
            </div>
            <div>
              <Label htmlFor="logo">Logo</Label>
              <Input type="file" name="logo" id="logo" />
              <p className="text-xs text-muted-foreground">
                The maximum size allowed for loading image is 384 pixels.
              </p>
            </div>
            <div>
              <Label htmlFor="url">Official Website (URL)</Label>
              <Input
                id="url"
                name="url"
                placeholder="Enter URL"
                type="url"
                pattern="[Hh][Tt][Tt][Pp][Ss]?:\/\/(?:(?:[a-zA-Z\u00a1-\uffff0-9]+-?)*[a-zA-Z\u00a1-\uffff0-9]+)(?:\.(?:[a-zA-Z\u00a1-\uffff0-9]+-?)*[a-zA-Z\u00a1-\uffff0-9]+)*(?:\.(?:[a-zA-Z\u00a1-\uffff]{2,}))(?::\d{2,5})?(?:\/[^\s]*)?"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="approved" name="approved" />
              <Label htmlFor="approved">Approved by CIOFF</Label>
            </div>
          </div>
        </section>
        <section className="mt-6">
          <h2 className="text-xl font-semibold">Dates</h2>
          <div className="mt-4 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="grid grid-cols-4 gap-4">
                <Label>Year {index + 1} *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }).map((_, day) => (
                      <SelectItem key={day} value={`${day + 1}`}>
                        {day + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }).map((_, month) => (
                      <SelectItem key={month} value={`${month + 1}`}>
                        {month + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }).map((_, year) => (
                      <SelectItem key={year} value={`${2023 + year}`}>
                        {2023 + year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </section>
        <section className="mt-6">
          <h2 className="text-xl font-semibold">Place</h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="place-name">Name of the place</Label>
              <Input id="place-name" placeholder="Enter place name" />
            </div>
            <div>
              <Label htmlFor="address1">Address 1</Label>
              <Input id="address1" placeholder="Enter address" />
            </div>
            <div>
              <Label htmlFor="address2">Address 2</Label>
              <Input id="address2" placeholder="Enter address" />
            </div>
            <div>
              <Label htmlFor="zip">ZIP</Label>
              <Input id="zip" placeholder="Enter ZIP code" />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="Enter city" />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Select>
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="country1">Country 1</SelectItem>
                  <SelectItem value="country2">Country 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
        <section className="mt-6">
          <h2 className="text-xl font-semibold">Contact</h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="contact-name">Name of the contact</Label>
              <Input id="contact-name" placeholder="Enter contact name" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="Enter phone number" />
            </div>
            <div>
              <Label htmlFor="fax">Fax</Label>
              <Input id="fax" placeholder="Enter fax number" />
            </div>
            <div>
              <Label htmlFor="mobile">Mobile</Label>
              <Input id="mobile" placeholder="Enter mobile number" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="Enter email address" />
            </div>
          </div>
        </section>
        <section className="mt-6">
          <h2 className="text-xl font-semibold">Categories</h2>
          <div className="mt-4 space-y-4">
            {/* <div className="flex items-center space-x-2"> */}
            {/*   <Checkbox id="cioff" /> */}
            {/*   <Label htmlFor="cioff">CIOFF</Label> */}
            {/*   <Checkbox id="cioff-label" /> */}
            {/*   <Label htmlFor="cioff-label">CIOFF Label</Label> */}
            {/*   <Select> */}
            {/*     <SelectTrigger> */}
            {/*       <SelectValue placeholder="Day" /> */}
            {/*     </SelectTrigger> */}
            {/*     <SelectContent> */}
            {/*       {Array.from({ length: 31 }).map((_, day) => ( */}
            {/*         <SelectItem key={day} value={day + 1}> */}
            {/*           {day + 1} */}
            {/*         </SelectItem> */}
            {/*       ))} */}
            {/*     </SelectContent> */}
            {/*   </Select> */}
            {/*   <Select> */}
            {/*     <SelectTrigger> */}
            {/*       <SelectValue placeholder="Month" /> */}
            {/*     </SelectTrigger> */}
            {/*     <SelectContent> */}
            {/*       {Array.from({ length: 12 }).map((_, month) => ( */}
            {/*         <SelectItem key={month} value={month + 1}> */}
            {/*           {month + 1} */}
            {/*         </SelectItem> */}
            {/*       ))} */}
            {/*     </SelectContent> */}
            {/*   </Select> */}
            {/*   <Select> */}
            {/*     <SelectTrigger> */}
            {/*       <SelectValue placeholder="Year" /> */}
            {/*     </SelectTrigger> */}
            {/*     <SelectContent> */}
            {/*       {Array.from({ length: 10 }).map((_, year) => ( */}
            {/*         <SelectItem key={year} value={2023 + year}> */}
            {/*           {2023 + year} */}
            {/*         </SelectItem> */}
            {/*       ))} */}
            {/*     </SelectContent> */}
            {/*   </Select> */}
            {/* </div> */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="international"
                  name="categories"
                  value="international"
                />
                <Label htmlFor="international">International</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="children-festival"
                  name="categories"
                  value="children-festival"
                />
                <Label htmlFor="children-festival">Children Festival</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="folk-singing"
                  name="categories"
                  value="folk-singing"
                />
                <Label htmlFor="folk-singing">Folk Singing</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="folk-dancing" name="categories" />
                <Label htmlFor="folk-dancing">Folk Dancing</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="folk-music" name="categories" />
                <Label htmlFor="folk-music">Folk Music</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="traditional-cooking" name="categories" />
                <Label htmlFor="traditional-cooking">Traditional Cooking</Label>
              </div>
              {/* <div> */}
              {/*   <Label>Traditional Trade</Label> */}
              {/*   <Checkbox id="traditional-trade" /> */}
              {/* </div> */}
              {/* <div> */}
              {/*   <Label>Traditional Game</Label> */}
              {/*   <Checkbox id="traditional-game" /> */}
              {/* </div> */}
              {/* <div> */}
              {/*   <Label>Exposition</Label> */}
              {/*   <Checkbox id="exposition" /> */}
              {/* </div> */}
              {/* <div> */}
              {/*   <Label>Conference</Label> */}
              {/*   <Checkbox id="conference" /> */}
              {/* </div> */}
              {/* <div> */}
              {/*   <Label>Authentic</Label> */}
              {/*   <Checkbox id="authentic" /> */}
              {/* </div> */}
              {/* <div> */}
              {/*   <Label>Elaborate</Label> */}
              {/*   <Checkbox id="elaborate" /> */}
              {/* </div> */}
              {/* <div> */}
              {/*   <Label>Stylized</Label> */}
              {/*   <Checkbox id="stylized" /> */}
              {/* </div> */}
            </div>
          </div>
        </section>
        <section className="mt-6">
          <h2 className="text-xl font-semibold">Pictures</h2>
          <div className="mt-4 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index}>
                <Label>Picture {index + 1}</Label>
                <Input type="file" />
                <p className="text-xs text-muted-foreground">
                  The maximum size allowed for loading image is 384 pixels.
                </p>
              </div>
            ))}
          </div>
        </section>
        <div className="mt-6 flex space-x-4">
          <Button variant="outline">Cancel</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </div>
  );
}
