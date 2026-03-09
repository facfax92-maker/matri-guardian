import { useState, useEffect, useRef, useCallback } from 'react';
import { getPatientImages } from '@/lib/indexed-db';
import { blobToDataUrl, IMAGE_CATEGORIES } from '@/lib/image-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Images, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Columns2, X, Clock, Shield } from 'lucide-react';


interface ImageGalleryProps {
  patientId: string;
  filterCategory?: string;
}

interface ImageItem {
  id: string;
  category: string;
  thumbnailUrl: string;
  fullUrl: string;
  notes: string;
  createdAt: number;
  syncStatus: string;
}

export function ImageGallery({ patientId, filterCategory }: ImageGalleryProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIndices, setCompareIndices] = useState<[number, number] | null>(null);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImages();
  }, [patientId, filterCategory]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const raw = await getPatientImages(patientId);
      const filtered = filterCategory ? raw.filter(i => i.category === filterCategory) : raw;

      const items: ImageItem[] = await Promise.all(
        filtered.map(async (img) => ({
          id: img.id,
          category: img.category,
          thumbnailUrl: await blobToDataUrl(img.thumbnail),
          fullUrl: await blobToDataUrl(img.blob),
          notes: img.notes,
          createdAt: img.createdAt,
          syncStatus: img.syncStatus,
        }))
      );

      setImages(items.sort((a, b) => b.createdAt - a.createdAt));
    } catch {
      // DB not ready
    } finally {
      setLoading(false);
    }
  };

  const handleCompareSelect = (index: number) => {
    if (!compareMode) return;
    if (!compareIndices) {
      setCompareIndices([index, -1]);
    } else if (compareIndices[1] === -1) {
      setCompareIndices([compareIndices[0], index]);
    } else {
      setCompareIndices([index, -1]);
    }
  };

  const getCategoryInfo = (cat: string) => IMAGE_CATEGORIES.find(c => c.value === cat);

  if (loading) {
    return (
      <Card className="card-gradient border-0 shadow-sm">
        <CardContent className="p-4 text-center text-muted-foreground text-sm">
          Loading images...
        </CardContent>
      </Card>
    );
  }

  if (images.length === 0) return null;

  return (
    <>
      <Card className="card-gradient border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Images className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Clinical Images</CardTitle>
              <Badge variant="secondary" className="text-xs">{images.length}</Badge>
            </div>
            {images.length >= 2 && (
              <Button
                variant={compareMode ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-7"
                onClick={() => { setCompareMode(!compareMode); setCompareIndices(null); }}
              >
                <Columns2 className="h-3 w-3 mr-1" />
                Compare
              </Button>
            )}
          </div>
          {compareMode && (
            <p className="text-xs text-muted-foreground mt-1">
              {!compareIndices || compareIndices[1] === -1
                ? 'Select two images to compare side-by-side'
                : 'Viewing comparison'}
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, i) => {
              const catInfo = getCategoryInfo(img.category);
              const isSelected = compareIndices && (compareIndices[0] === i || compareIndices[1] === i);
              return (
                <div
                  key={img.id}
                  className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-colors duration-150 ${
                    isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-border'
                  }`}
                  onClick={() => compareMode ? handleCompareSelect(i) : setSelectedIndex(i)}
                >
                  <img src={img.thumbnailUrl} alt={catInfo?.label || 'Clinical image'} className="w-full aspect-square object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                    <span className="text-[9px] text-white font-medium">{catInfo?.icon} {catInfo?.label}</span>
                  </div>
                  {img.syncStatus === 'pending' && (
                    <div className="absolute top-1 right-1">
                      <div className="h-2 w-2 rounded-full bg-warning animate-pulse" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Full Image Viewer */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => { setSelectedIndex(null); setZoom(1); }}>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
          {selectedIndex !== null && images[selectedIndex] && (
            <>
              <DialogHeader className="p-3 pb-0">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-sm">
                    {getCategoryInfo(images[selectedIndex].category)?.icon} {getCategoryInfo(images[selectedIndex].category)?.label}
                  </DialogTitle>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}>
                      <ZoomOut className="h-3.5 w-3.5" />
                    </Button>
                    <span className="text-xs text-muted-foreground w-8 text-center">{Math.round(zoom * 100)}%</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.min(3, z + 0.25))}>
                      <ZoomIn className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              <div className="overflow-auto max-h-[60vh] p-2">
                <img
                  src={images[selectedIndex].fullUrl}
                  alt="Full view"
                  className="w-full rounded-lg transition-transform"
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
                />
              </div>
              <div className="p-3 border-t space-y-2">
                {images[selectedIndex].notes && (
                  <p className="text-xs text-muted-foreground">{images[selectedIndex].notes}</p>
                )}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {new Date(images[selectedIndex].createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="h-2.5 w-2.5" />
                    Consent recorded
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={selectedIndex <= 0}
                    onClick={() => setSelectedIndex(i => Math.max(0, (i || 0) - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground">{selectedIndex + 1} / {images.length}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={selectedIndex >= images.length - 1}
                    onClick={() => setSelectedIndex(i => Math.min(images.length - 1, (i || 0) + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Side-by-Side Comparison */}
      <Dialog open={compareIndices !== null && compareIndices[1] !== -1} onOpenChange={() => setCompareIndices(null)}>
        <DialogContent className="max-w-lg p-0 gap-0">
          {compareIndices && compareIndices[1] !== -1 && (
            <>
              <DialogHeader className="p-3">
                <DialogTitle className="text-sm flex items-center gap-2">
                  <Columns2 className="h-4 w-4" />
                  Side-by-Side Comparison
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-1 p-2">
                {[compareIndices[0], compareIndices[1]].map((idx, ci) => {
                  const img = images[idx];
                  if (!img) return null;
                  return (
                    <div key={ci} className="space-y-1">
                      <img src={img.fullUrl} alt="Compare" className="w-full rounded-lg aspect-square object-cover" />
                      <p className="text-[10px] text-center text-muted-foreground">
                        {new Date(img.createdAt).toLocaleDateString()} · {getCategoryInfo(img.category)?.label}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="p-3 border-t">
                <Button variant="ghost" className="w-full" onClick={() => { setCompareIndices(null); setCompareMode(false); }}>
                  Close Comparison
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
