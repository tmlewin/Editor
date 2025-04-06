"use client";

import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlignLeft, AlignCenter, AlignRight, ImageIcon } from "lucide-react";

interface ImageDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  imageWidth: number;
  setImageWidth: (width: number) => void;
  imageHeight: number;
  setImageHeight: (height: number) => void;
  imageAlt: string;
  setImageAlt: (alt: string) => void;
  imageAlignment: 'left' | 'center' | 'right';
  setImageAlignment: (alignment: 'left' | 'center' | 'right') => void;
  insertImage: () => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ImageDialog({
  open,
  setOpen,
  imageUrl,
  setImageUrl,
  imageFile,
  setImageFile,
  imageWidth,
  setImageWidth,
  imageHeight,
  setImageHeight,
  imageAlt,
  setImageAlt,
  imageAlignment,
  setImageAlignment,
  insertImage,
  handleImageUpload,
}: ImageDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
          <DialogDescription>
            Upload an image or enter an image URL to insert into your document.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Image Source Tabs */}
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Image</TabsTrigger>
              <TabsTrigger value="url">Image URL</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-4">
              <div className="flex flex-col gap-4">
                <Label htmlFor="image-upload">Select Image</Label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  ref={fileInputRef}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 flex flex-col items-center justify-center border-dashed"
                >
                  <ImageIcon className="h-8 w-8 mb-2 text-muted-foreground" />
                  <span>Click to select an image</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Supports JPG, PNG, GIF, WebP
                  </span>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="url" className="mt-4">
              <div className="flex flex-col gap-4">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Image Preview */}
          {imageUrl && (
            <div className="mt-4">
              <Label>Preview</Label>
              <div className="mt-2 border rounded p-4 flex justify-center">
                <img
                  src={imageUrl}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    width: imageWidth,
                    height: imageHeight
                  }}
                />
              </div>
            </div>
          )}

          {/* Image Properties */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="image-width">Width (px)</Label>
              <Input
                id="image-width"
                type="number"
                value={imageWidth}
                onChange={(e) => setImageWidth(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="image-height">Height (px)</Label>
              <Input
                id="image-height"
                type="number"
                value={imageHeight}
                onChange={(e) => setImageHeight(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="image-alt">Alt Text</Label>
            <Input
              id="image-alt"
              placeholder="Describe the image"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
            />
          </div>

          <div>
            <Label>Alignment</Label>
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant={imageAlignment === 'left' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setImageAlignment('left')}
              >
                <AlignLeft className="h-4 w-4 mr-1" />
                Left
              </Button>
              <Button
                type="button"
                variant={imageAlignment === 'center' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setImageAlignment('center')}
              >
                <AlignCenter className="h-4 w-4 mr-1" />
                Center
              </Button>
              <Button
                type="button"
                variant={imageAlignment === 'right' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setImageAlignment('right')}
              >
                <AlignRight className="h-4 w-4 mr-1" />
                Right
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={insertImage}
            disabled={!imageUrl}
          >
            Insert Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}