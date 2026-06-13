import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useApi } from '@/hooks/useApi';
import { useNavigationFlow } from '@/hooks/useNavigationFlow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileAvatar from '@/components/ProfileAvatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NavigationHeader from '@/components/NavigationHeader';
import { Star, Calendar, Loader2, Search, Filter, X } from 'lucide-react';
import { toast } from 'sonner';

interface Therapist {
  id: number;
  user: {
    id: number;
    full_name: string;
    email: string;
  };
  specialization: string;
  bio: string;
  price: number;
  rating: number;
  languages: string;
  is_verified: boolean;
}

export default function Therapists() {
  const { t } = useLanguage();
  const { goToBookingFlow } = useNavigationFlow();
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const { get } = useApi();
  const observer = useRef<IntersectionObserver | null>(null);

  // Ref for the last therapist card to trigger infinite scroll
  const lastTherapistRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore]);

  useEffect(() => {
    fetchTherapists(1);
  }, []);

  // Refetch when filters change
  useEffect(() => {
    setPage(1);
    setTherapists([]);
    fetchTherapists(1);
  }, [searchQuery, specialtyFilter, languageFilter, priceFilter, ratingFilter]);

  useEffect(() => {
    if (page > 1) {
      fetchTherapists(page);
    }
  }, [page]);

  const buildQueryString = (pageNum: number) => {
    const params = new URLSearchParams();
    params.append('page', pageNum.toString());
    
    if (searchQuery) params.append('search', searchQuery);
    if (specialtyFilter !== 'all') params.append('specialization', specialtyFilter);
    if (languageFilter !== 'all') params.append('language', languageFilter);
    if (priceFilter !== 'all') {
      if (priceFilter === 'low') params.append('max_price', '1000');
      else if (priceFilter === 'medium') {
        params.append('min_price', '1000');
        params.append('max_price', '2000');
      } else if (priceFilter === 'high') params.append('min_price', '2000');
    }
    if (ratingFilter !== 'all') params.append('min_rating', ratingFilter);
    
    return params.toString();
  };

  const fetchTherapists = async (pageNum: number) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const queryString = buildQueryString(pageNum);
      const data = await get(`/users/therapists/?${queryString}`);
      const therapistsList = data.results || data;
      
      if (pageNum === 1) {
        setTherapists(Array.isArray(therapistsList) ? therapistsList : []);
      } else {
        setTherapists(prev => [...prev, ...(Array.isArray(therapistsList) ? therapistsList : [])]);
      }
      
      // Check if there are more pages
      setHasMore(!!data.next);
    } catch (error) {
      console.error('Error fetching therapists:', error);
      toast.error('Failed to load therapists');
      if (pageNum === 1) {
        setTherapists([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const clearFilters = () => {
    setSearchQuery('');
    setSpecialtyFilter('all');
    setLanguageFilter('all');
    setPriceFilter('all');
    setRatingFilter('all');
  };

  const hasActiveFilters = searchQuery || specialtyFilter !== 'all' || languageFilter !== 'all' || priceFilter !== 'all' || ratingFilter !== 'all';

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader 
        title="Our Verified Therapists"
        subtitle="Connect with experienced mental health professionals"
      />
      <div className="container mx-auto px-4 py-8">

        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by name, specialization, or language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12 text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1">
                  {[searchQuery, specialtyFilter !== 'all', languageFilter !== 'all', priceFilter !== 'all', ratingFilter !== 'all'].filter(Boolean).length}
                </Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>

          {/* Filter Options */}
          {showFilters && (
            <Card className="p-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Specialty Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Specialty</label>
                  <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specialties</SelectItem>
                      <SelectItem value="Depression">Depression</SelectItem>
                      <SelectItem value="Anxiety">Anxiety</SelectItem>
                      <SelectItem value="Trauma">Trauma & PTSD</SelectItem>
                      <SelectItem value="Family">Family Therapy</SelectItem>
                      <SelectItem value="Child">Child & Adolescent</SelectItem>
                      <SelectItem value="Stress">Stress Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Language Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <Select value={languageFilter} onValueChange={setLanguageFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Amharic">Amharic</SelectItem>
                      <SelectItem value="Tigrigna">Tigrigna</SelectItem>
                      <SelectItem value="Somali">Somali</SelectItem>
                      <SelectItem value="Afan Oromo">Afan Oromo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price Range</label>
                  <Select value={priceFilter} onValueChange={setPriceFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="low">Under ETB 1,000</SelectItem>
                      <SelectItem value="medium">ETB 1,000 - 2,000</SelectItem>
                      <SelectItem value="high">Above ETB 2,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Minimum Rating</label>
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="4.5">4.5+ Stars</SelectItem>
                      <SelectItem value="4.0">4.0+ Stars</SelectItem>
                      <SelectItem value="3.5">3.5+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery('')} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {specialtyFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Specialty: {specialtyFilter}
                  <button onClick={() => setSpecialtyFilter('all')} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {languageFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Language: {languageFilter}
                  <button onClick={() => setLanguageFilter('all')} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {priceFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Price: {priceFilter === 'low' ? 'Under 1,000' : priceFilter === 'medium' ? '1,000-2,000' : 'Above 2,000'}
                  <button onClick={() => setPriceFilter('all')} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {ratingFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Rating: {ratingFilter}+ Stars
                  <button onClick={() => setRatingFilter('all')} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {therapists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No therapists available at the moment.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {therapists.map((therapist, index) => {
                const name = therapist.user?.full_name || therapist.user?.email || 'Therapist';
                const languagesList = therapist.languages ? therapist.languages.split(',').map(l => l.trim()) : [];
                const isLastItem = index === therapists.length - 1;
                
                return (
                  <Card 
                    key={therapist.id} 
                    ref={isLastItem ? lastTherapistRef : null}
                    className="shadow-soft hover:shadow-hover transition-smooth"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-4 mb-3">
                        <ProfileAvatar 
                          user={{
                            ...therapist,
                            full_name: name,
                            avatar: therapist.avatar
                          }} 
                          size="lg" 
                          className="h-16 w-16"
                        />
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{name}</CardTitle>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{therapist.rating || 'N/A'}</span>
                            {therapist.is_verified && (
                              <Badge variant="secondary" className="ml-2 text-xs">Verified</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Specialty</p>
                        <p className="font-medium">{therapist.specialization || 'General'}</p>
                      </div>
                      {therapist.bio && (
                        <div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{therapist.bio}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Languages</p>
                        <div className="flex flex-wrap gap-1">
                          {languagesList.length > 0 ? (
                            languagesList.map((lang, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {lang}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline" className="text-xs">English</Badge>
                          )}
                        </div>
                      </div>
                      <div className="pt-2">
                        <p className="text-2xl font-bold text-primary">
                          ETB {therapist.price || '1,500'}
                          <span className="text-sm text-muted-foreground font-normal">/session</span>
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => goToBookingFlow(therapist.id.toString(), 'profile')}
                        className="w-full gradient-primary"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            
            {/* Loading more indicator */}
            {loadingMore && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            
            {/* End of list message */}
            {!hasMore && therapists.length > 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You've seen all therapists</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
