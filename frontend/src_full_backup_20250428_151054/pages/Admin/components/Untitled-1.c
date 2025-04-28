#include <stdio.h>

int main(){
  int a[100], b[50],n,m;

int *pa, *pb;

pa=a;

pb=b;

printf("n=");

scanf("%d",&n);

printf("m=");

scanf("%d", &m);

for (pa=a; pa<a+m;pa++)

{printf("a[%d]=",pa-a);

scanf("%d",pa);

for(pb=b;pb<b+1;pb++){

printf("b[%d]=",pb-b);

scanf("%d",pb);

printf("affichage de a\n");

for (pa=a;pa<a+n;pa++)

printf("a[%d]=%d\n",pa-a, *pa);

}

}
return 0;
}