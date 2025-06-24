#!/usr/local/bin/perl

# "THE BEER-WARE LICENSE" (Revision 42):
# 
# shurd@FreeBSD.ORG wrote this file. As long as you retain this notice
# you can do whatever you want with this stuff. If we meet some day, and
# you think this stuff is worth it, you can buy me a beer in return.
# 
# Stephen Hurd

use strict;
use JSON;
use Data::Dumper;

my %output = ();

open IN, '<', 'allspells.txt';
my $level = 0;
while (<IN>) {
	chomp;
	next if /^\s*$/;
	s/´/'/g;
	s/’/'/g;
	if (/^Cantrips \(0 Level\)$/) {
		$level = 0;
	}
	elsif (/([0-9]+)(?:st|nd|rd|th) Level$/) {
		$level = $1 + 0;
	}
	elsif (/^([^(]+)\s+\((Abjuration|alteration|Conjuration|Divination|Enchantment|Evocation|Illusion|Necromancy|Transmutation)\)(?:\s+\(([^)]+)\))*\s+\[([^\]]+)\]$/i) {
		my ($name, $school, $ritual, $sources) = (lc($1), lc($2), $3, $4);
		$school = 'transmutation' if ($school eq 'alteration');
		die "Duplicate $name" if (defined $output{$name});
		my $r;
		if (defined $ritual) {
			$r = $JSON::true;
		}
		else {
			$r = $JSON::false;
		}
		my @s = split(/,\s*/, $sources);
		$output{$name} = {
			name => $name,
			school => $school,
			circle => $level,
			styles => [],
			ritual => $r,
			sources => \@s
		};
	}
	else {
		print STDERR "Unhandled line '$_'\n";
	}
}
close IN;

open IN, '<', 'styles.txt';
my $style;
while (<IN>) {
	chomp;
	next if /^\s*$/;
	s/´/'/g;
	s/’/'/g;
	if (/^Cantrips? \(0 Level\)$/i) {
		$level = 0;
	}
	elsif (/([0-9]+)(?:st|nd|rd|th) Level$/i) {
		$level = $1 + 0;
	}
	elsif (/^(.*) Magic$/) {
		$style = $1;
	}
	elsif (/^([^(]+?)\*?\s+\((Abjuration|alteration|Conjuration|Divination|Enchantment|Evocation|Illusion|Necromancy|Transmutation)\)$/i) {
		my ($name, $school) = (lc($1), lc($2));
		$school = 'transmutation' if ($school eq 'alteration');
		if (!defined $output{$name}) {
			#print STDERR "Unknown spell: '$name'\n";
		}
		else {
			push(@{$output{$name}{'styles'}}, lc($style));
		}
	}
	else {
		print STDERR "Unhandled style line '$_'\n";
	}
}

#print Dumper(\%output);
print to_json(\%output, {pretty => 1, canonical => 1});
